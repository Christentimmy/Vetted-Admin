import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, 
  User, 
  Plus, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  X, 
  MoreVertical, 
  Shield, 
  ShieldCheck, 
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Settings,
  LogOut,
  Bell,
  Moon,
  Sun,
  Menu,
  Home,
  Users,
  BarChart3,
  FileText,
  Eye
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { authService } from '../services/auth';
import { API_BASE_URL } from '../config';

type UserRole = 'admin' | 'moderator' | 'user' | 'support';

const roleIcons = {
  admin: <Shield className="w-4 h-4" />,
  moderator: <ShieldCheck className="w-4 h-4" />,
  user: <User className="w-4 h-4" />,
  support: <Phone className="w-4 h-4" />
};

const roleColors = {
  admin: 'from-purple-500 to-indigo-600',
  moderator: 'from-blue-500 to-cyan-600',
  user: 'from-gray-500 to-gray-600',
  support: 'from-emerald-500 to-teal-600'
};

interface User {
  _id: string;
  email?: string;
  displayName: string;
  accountStatus: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

interface UsersResponse {
  message: string;
  data: User[];
  pagination: PaginationInfo;
}

const UserManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'active' | 'inactive' | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    hasMore: false
  });
  const [parent] = useAutoAnimate();
  
  const roles: UserRole[] = ['admin', 'moderator', 'user', 'support'];
  
  const statusVariants = {
    active: {
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      color: '#10B981',
      icon: <Check className="w-3 h-3 mr-1" />
    },
    inactive: {
      backgroundColor: 'rgba(107, 114, 128, 0.1)',
      color: '#6B7280',
      icon: <X className="w-3 h-3 mr-1" />
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [navigate]);

  const handleToggleBan = useCallback(async (userId: string) => {
    try {
      const token = localStorage.getItem('vetted_admin_token');
      const response = await fetch(`${API_BASE_URL}/admin/toggle-ban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle ban status');
      }

      // Update the user's status in the local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId 
            ? { ...user, accountStatus: user.accountStatus === 'active' ? 'inactive' : 'active' }
            : user
        )
      );

      // Close the expanded card
      setSelectedUser(null);
    } catch (error) {
      console.error('Error toggling ban status:', error);
      setError('Failed to update user status');
    }
  }, []);

  const handlePreviousPage = () => {
    if (pagination.page > 1) {
      fetchUsers(pagination.page - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.hasMore) {
      fetchUsers(pagination.page + 1);
    }
  };

  // Navigation items for the sidebar
  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Phone, label: 'Phone Lookup', path: '/phone-lookup' },
    { icon: Users, label: 'User Management', path: '/users' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Shield, label: 'Security', path: '/security' },
    { icon: FileText, label: 'Reports', path: '/reports' }
  ] as const;
  
  // Get the current path to determine active nav item
  const currentPath = location.pathname;
  
  // Fetch users from API
  const fetchUsers = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('vetted_admin_token');
      const response = await fetch(`${API_BASE_URL}/admin/all-users?page=${page}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const result: UsersResponse = await response.json();
      setUsers(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError('Failed to load users');
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = searchTerm === '' || 
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = selectedRole === 'all' || user.accountStatus === selectedRole;
      
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, selectedRole]);
  
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };
  
  const toggleUserSelection = (userId: string) => {
    setSelectedUser(selectedUser === userId ? null : userId);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wine-600"></div>
      </div>
    );
  }
  
  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-['Inter',sans-serif] overflow-x-hidden">

        {/* Sidebar */}
        <div 
          className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
          aria-label="Sidebar"
        >
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-wine-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-semibold text-gray-900 dark:text-white truncate">Tea Admin</span>
            </div>
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <nav className="mt-6 px-3 sm:px-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)] pb-20">
            {navItems.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  currentPath === item.path
                    ? 'bg-wine-50 dark:bg-wine-900/30 text-wine-700 dark:text-wine-300 border-r-2 border-wine-600'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-gray-900/80 backdrop-blur-sm lg:hidden"
            onClick={toggleSidebar}
            aria-hidden="true"
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          {/* Top Bar */}
          <header className="flex items-center justify-between h-16 px-2 sm:px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            {/* Left side - Menu and Search */}
            <div className="flex-1 flex items-center">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 lg:hidden"
                aria-label="Toggle menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div className="relative ml-2 max-w-xs w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Right side - Icons */}
            <div className="flex items-center space-x-1 sm:space-x-2 ml-2">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              
              <button 
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>
              </button>
              
              <div className="relative">
                <button className="p-1.5 rounded-full bg-wine-600 text-white">
                  <User className="w-4 h-4" />
                </button>
                <div className="hidden group-hover:block absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Your Profile
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Settings
                  </a>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
              {/* Page Header */}
              <div className="mb-6 sm:mb-8">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">User Management</h1>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">Manage team members and their permissions</p>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 p-4 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => setShowFilters(!showFilters)}
                      className="inline-flex items-center px-3.5 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-wine-500 focus:ring-offset-2"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                      {showFilters ? (
                        <ChevronUp className="ml-1.5 w-4 h-4" />
                      ) : (
                        <ChevronDown className="ml-1.5 w-4 h-4" />
                      )}
                    </button>
                    <Link
                      to="/users/new"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-wine-600 to-wine-500 hover:from-wine-700 hover:to-wine-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wine-500 transition-all duration-200"
                    >
                      <UserPlus className="-ml-0.5 mr-2 h-4 w-4" />
                      Add User
                    </Link>
                  </div>
                </div>
      
      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Search
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-wine-500 focus:border-wine-500 sm:text-sm"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-wine-500 focus:border-wine-500 sm:text-sm rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as 'active' | 'inactive' | 'all')}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedRole('all');
                    }}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wine-500"
                  >
                    <X className="-ml-1 mr-2 h-4 w-4" />
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* User Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start" ref={parent}>
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 ${
                selectedUser === user._id ? 'ring-2 ring-wine-500' : 'hover:shadow-md'
              }`}
            >
              <div 
                className={`p-5 cursor-pointer ${selectedUser === user._id ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`}
                onClick={() => toggleUserSelection(user._id)}
              >
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`relative`}>
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white bg-gradient-to-br from-wine-500 to-wine-600`}>
                          <User className="w-6 h-6" />
                        </div>
                        <span 
                          className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-gray-800 ${
                            user.accountStatus === 'active' ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                          title={user.accountStatus === 'active' ? 'Active' : 'Inactive'}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {user.displayName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email || 'No email provided'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.accountStatus === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {user.accountStatus === 'active' ? 'Active' : 'Inactive'}
                      </span>
                      <button className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                </div>
                
                <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="h-4 w-4 mr-1.5" />
                  <span>Joined {formatDate(user.createdAt)}</span>
                </div>
              </div>
              
              {/* Expanded User Actions */}
              <AnimatePresence>
                {selectedUser === user._id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-gray-200 dark:border-gray-700"
                  >
                    <div className="p-4 space-y-3">
                      <button className="w-full flex items-center px-3 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                        <Mail className="h-4 w-4 mr-2 text-gray-500" />
                        Send Message
                      </button>
                      <button 
                        onClick={() => handleToggleBan(user._id)}
                        className="w-full flex items-center px-3 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        {user.accountStatus === 'active' ? 'Ban User' : 'Unban User'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No users found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || selectedRole !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No users in the system yet'}
            </p>
            {!searchTerm && selectedRole === 'all' && (
              <div className="mt-6">
                <Link
                  to="/users/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-wine-600 hover:bg-wine-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wine-500"
                >
                  <UserPlus className="-ml-1 mr-2 h-4 w-4" />
                  Add New User
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
        
      {/* Pagination */}
      <div className="flex items-center justify-between mt-8">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
          <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
          <span className="font-medium">{pagination.total}</span> users
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handlePreviousPage}
            disabled={pagination.page <= 1}
            className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button 
            onClick={handleNextPage}
            disabled={!pagination.hasMore}
            className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
