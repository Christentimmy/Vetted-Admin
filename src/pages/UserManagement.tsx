import { useState, useEffect, useMemo } from 'react';
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
  LogOut
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutoAnimate } from '@formkit/auto-animate/react';

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
  email: string;
  displayName: string;
  role: UserRole;
  isActive: boolean;
  lastActive: string;
  createdAt: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
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
  
  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data
        const mockUsers: User[] = [
          {
            _id: '1',
            email: 'admin@example.com',
            displayName: 'Alex Johnson',
            role: 'admin',
            isActive: true,
            lastActive: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
            createdAt: '2023-01-15T10:30:00Z'
          },
          {
            _id: '2',
            email: 'mod@example.com',
            displayName: 'Sam Wilson',
            role: 'moderator',
            isActive: true,
            lastActive: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
            createdAt: '2023-03-22T14:15:00Z'
          },
          {
            _id: '3',
            email: 'user1@example.com',
            displayName: 'Jamie Smith',
            role: 'user',
            isActive: true,
            lastActive: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
            createdAt: '2023-05-10T09:45:00Z'
          },
          {
            _id: '4',
            email: 'support@example.com',
            displayName: 'Taylor Swift',
            role: 'support',
            isActive: false,
            lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            createdAt: '2023-02-18T16:20:00Z'
          },
          {
            _id: '5',
            email: 'user2@example.com',
            displayName: 'Jordan Lee',
            role: 'user',
            isActive: true,
            lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            createdAt: '2023-04-05T11:10:00Z'
          }
        ];
        
        setUsers(mockUsers);
      } catch (err) {
        setError('Failed to load users');
        console.error('Error fetching users:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = searchTerm === '' || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = selectedRole === 'all' || user.role === selectedRole;
      
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wine-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 p-4 rounded-lg">
        {error}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-wine-600 to-wine-400 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage team members and their permissions
          </p>
        </div>
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
                    Role
                  </label>
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-wine-500 focus:border-wine-500 sm:text-sm rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole | 'all')}
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                    <option value="user">User</option>
                    <option value="support">Support</option>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" ref={parent}>
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
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white bg-gradient-to-br ${roleColors[user.role]}`}>
                        {roleIcons[user.role]}
                      </div>
                      <span 
                        className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-gray-800 ${
                          user.isActive ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                        title={user.isActive ? 'Active' : 'Inactive'}
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {user.displayName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1.5" />
                    <span>Joined {formatDate(user.createdAt)}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Last active</div>
                    <div className="font-medium">{getTimeAgo(user.lastActive)}</div>
                  </div>
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
                      <button className="w-full flex items-center px-3 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                        <Settings className="h-4 w-4 mr-2 text-gray-500" />
                        Edit Profile
                      </button>
                      <button className="w-full flex items-center px-3 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <LogOut className="h-4 w-4 mr-2" />
                        Deactivate User
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
          Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredUsers.length}</span> of{' '}
          <span className="font-medium">{users.length}</span> users
        </div>
        <div className="flex space-x-2">
          <button 
            disabled={true}
            className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button 
            disabled={filteredUsers.length < 6}
            className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
      </div>
  );
};

export default UserManagement;
