import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  X, 
  MoreVertical, 
  Phone,
  Settings,
  Bell,
  Moon,
  Sun,
  Menu,
  Home,
  Users,
  FileText,
  CreditCard,
  Trash2,
  Headphones
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { authService } from '../services/auth';
import { adminManagementService, Admin, PaginationInfo } from '../services/admin_management';
import Snackbar from '../components/Snackbar';
import { useDashboardLayout } from '../components/DashboardLayoutContext';

 

const AdminManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const layout = useDashboardLayout();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'inactive' | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    hasMore: false
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    email: '',
    username: '',
    password: '',
    role: 'admin',
    permissions: []
  });
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    isOpen: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    isOpen: false,
    message: '',
    type: 'success'
  });
  const [parent] = useAutoAnimate();
  
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

  const fetchAdmins = useCallback(async (page: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminManagementService.getAllAdmins(page);
      setAdmins(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching admins:', error);
      setError('Failed to load admins. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleToggleStatus = useCallback(async (adminId: string) => {
    try {
      await adminManagementService.toggleAdminStatus(adminId);

      // Update the admin's status in the local state
      setAdmins(prevAdmins => 
        prevAdmins.map(admin => 
          admin._id === adminId 
            ? { ...admin, accountStatus: admin.accountStatus === 'active' ? 'inactive' : 'active' }
            : admin
        )
      );

      // Close the expanded card
      setSelectedAdmin(null);
      showSnackbar('Admin status updated successfully', 'success');
    } catch (error) {
      console.error('Error toggling admin status:', error);
      showSnackbar('Failed to update admin status', 'error');
    }
  }, []);

  const handleDeleteAdmin = useCallback(async (adminId: string) => {
    try {
      await adminManagementService.deleteAdmin(adminId);

      // Remove the admin from the local state
      setAdmins(prevAdmins => prevAdmins.filter(admin => admin._id !== adminId));

      // Close the expanded card
      setSelectedAdmin(null);
      showSnackbar('Admin deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting admin:', error);
      showSnackbar('Failed to delete admin', 'error');
    }
  }, []);

  const handlePreviousPage = () => {
    if (pagination && pagination.page > 1) {
      fetchAdmins(pagination.page - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination && pagination.hasMore) {
      fetchAdmins(pagination.page + 1);
    }
  };

  const handleCreateAdmin = async () => {
    // Basic validation
    if (!newAdminData.email || !newAdminData.username) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }

    try {
      setIsCreatingAdmin(true);
      const newAdmin = await adminManagementService.createAdmin({
        ...newAdminData,
        role: newAdminData.role as "admin" | "superadmin"
      });

      // Add the new admin to the local state
      setAdmins(prevAdmins => [newAdmin, ...prevAdmins]);

      // Close dialog and reset state
      setShowCreateDialog(false);
      setNewAdminData({
        email: '',
        username: '',
        password: '',
        role: 'admin',
        permissions: []
      });
      
      showSnackbar('Admin created successfully!', 'success');
    } catch (error: any) {
      console.error('Error creating admin:', error);
      showSnackbar(error.message || 'Failed to create admin. Please try again.', 'error');
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const showSnackbar = (message: string, type: 'success' | 'error') => {
    setSnackbar({
      isOpen: true,
      message,
      type
    });
  };

  const closeSnackbar = () => {
    setSnackbar(prev => ({ ...prev, isOpen: false }));
  };

  // Navigation items for the sidebar
  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: CreditCard, label: 'Subscriptions', path: '/subscriptions' },
    { icon: Users, label: 'Users', path: '/users' },
    { icon: FileText, label: 'Reports', path: '/reports' },
    { icon: Headphones, label: 'Support', path: '/support' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];
  
  // Get the current path to determine active nav item
  const currentPath = location.pathname;

  // Filter admins based on search term and selected status
  const filteredAdmins = useMemo(() => {
    return admins.filter(admin => {
      const matchesSearch = 
        (admin.username?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        selectedStatus === 'all' ||
        admin.accountStatus === selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [admins, searchTerm, selectedStatus]);

  if (layout?.isInLayout) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <div className="p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Management</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Manage all admin users and their permissions
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex space-x-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wine-500"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {showFilters ? (
                    <ChevronUp className="w-4 h-4 ml-1" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </button>
                <button
                  onClick={() => setShowCreateDialog(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-wine-600 hover:bg-wine-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wine-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Admin
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden mb-6"
                >
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Status
                        </label>
                        <div className="flex space-x-2">
                          {['all', 'active', 'inactive'].map((status) => (
                            <button
                              key={status}
                              onClick={() => setSelectedStatus(status as any)}
                              className={`px-3 py-1.5 text-xs font-medium rounded-md ${
                                selectedStatus === status
                                  ? 'bg-wine-100 dark:bg-wine-900/30 text-wine-700 dark:text-wine-300 border border-wine-200 dark:border-wine-800'
                                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                              }`}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              {isLoading ? (
                <div className="p-8 flex justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-wine-600"></div>
                </div>
              ) : filteredAdmins.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                    <Users className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                    No admins found
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'Try adjusting your search or filters' : 'Add your first admin to get started'}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={() => setShowCreateDialog(true)}
                      className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-wine-600 hover:bg-wine-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wine-500"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Admin
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Admin
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Role
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Created
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody ref={parent} className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredAdmins.map((admin) => (
                          <React.Fragment key={admin._id}>
                            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/60">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center text-white font-medium">
                                    {admin.username ? admin.username.charAt(0).toUpperCase() : 'A'}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {admin.username || 'Unnamed Admin'}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {admin.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white capitalize">
                                {admin.role}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div 
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                                  style={{ 
                                    backgroundColor: statusVariants[admin.accountStatus].backgroundColor,
                                    color: statusVariants[admin.accountStatus].color 
                                  }}
                                >
                                  {statusVariants[admin.accountStatus].icon}
                                  {admin.accountStatus.charAt(0).toUpperCase() + admin.accountStatus.slice(1)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {new Date(admin.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => setSelectedAdmin(selectedAdmin === admin._id ? null : admin._id)}
                                  className="text-wine-600 hover:text-wine-900 dark:text-wine-400 dark:hover:text-wine-200"
                                >
                                  <MoreVertical className="w-5 h-5" />
                                </button>
                              </td>
                            </tr>
                            <AnimatePresence>
                              {selectedAdmin === admin._id && (
                                <motion.tr
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <td colSpan={5} className="px-6 py-4 bg-gray-50 dark:bg-gray-700/60">
                                    <div className="flex flex-wrap gap-2">
                                      <button
                                        onClick={() => handleToggleStatus(admin._id)}
                                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wine-500"
                                      >
                                        {admin.accountStatus === 'active' ? (
                                          <>
                                            <X className="w-3.5 h-3.5 mr-1.5" />
                                            Deactivate
                                          </>
                                        ) : (
                                          <>
                                            <Check className="w-3.5 h-3.5 mr-1.5" />
                                            Activate
                                          </>
                                        )}
                                      </button>
                                      <button
                                        onClick={() => handleDeleteAdmin(admin._id)}
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                      >
                                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                </motion.tr>
                              )}
                            </AnimatePresence>
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {pagination && pagination.totalPages > 1 && (
                    <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            Showing <span className="font-medium">{pagination && ((pagination.page - 1) * pagination.limit + 1)}</span> to{' '}
                            <span className="font-medium">{pagination && Math.min(pagination.page * pagination.limit, pagination.total)}</span>{' '}
                            of <span className="font-medium">{pagination && pagination.total}</span> results
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={handlePreviousPage}
                            disabled={!pagination || pagination.page === 1}
                            className={`px-3 py-1.5 rounded-md border text-sm ${!pagination || pagination.page === 1 ? 'text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600' : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600'}`}
                          >
                            Previous
                          </button>
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {pagination ? `${pagination.page} / ${pagination.totalPages}` : '0 / 0'}
                          </span>
                          <button
                            onClick={handleNextPage}
                            disabled={!pagination || !pagination.hasMore}
                            className={`px-3 py-1.5 rounded-md border text-sm ${!pagination || !pagination.hasMore ? 'text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600' : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600'}`}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <AnimatePresence>
              {showCreateDialog && (
                <>
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowCreateDialog(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden w-full max-w-md mx-auto">
                      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Admin</h3>
                      </div>
                      <div className="p-6 space-y-4">
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            id="email"
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-wine-500 focus:border-wine-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="admin@example.com"
                            value={newAdminData.email}
                            onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                          />
                        </div>
                        <div>
                          <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Username <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="username"
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-wine-500 focus:border-wine-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="johndoe"
                            value={newAdminData.username}
                            onChange={(e) => setNewAdminData({ ...newAdminData, username: e.target.value })}
                          />
                        </div>
                        <div>
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Password <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="password"
                            id="password"
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-wine-500 focus:border-wine-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="••••••••"
                            value={newAdminData.password}
                            onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
                          />
                        </div>
                        <div>
                          <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Role
                          </label>
                          <select
                            id="role"
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-wine-500 focus:border-wine-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            value={newAdminData.role}
                            onChange={(e) => setNewAdminData({ ...newAdminData, role: e.target.value })}
                          >
                            <option value="admin">Admin</option>
                            <option value="superadmin">Super Admin</option>
                          </select>
                        </div>
                      </div>
                      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setShowCreateDialog(false)}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wine-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleCreateAdmin}
                          disabled={isCreatingAdmin}
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-wine-600 hover:bg-wine-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wine-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                          {isCreatingAdmin && (
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          )}
                          Create Admin
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <Snackbar
              isOpen={snackbar.isOpen}
              message={snackbar.message}
              type={snackbar.type}
              onClose={closeSnackbar}
            />
          </div>
        </div>
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
                  placeholder="Search admins..."
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
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="relative">
                <button 
                  className="flex items-center p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-wine-500 to-wine-600 flex items-center justify-center text-white font-medium text-sm">
                    SA
                  </div>
                </button>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
              {/* Page Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Management</h1>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Manage all admin users and their permissions
                  </p>
                </div>
                <div className="mt-4 sm:mt-0 flex space-x-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wine-500"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                    {showFilters ? (
                      <ChevronUp className="w-4 h-4 ml-1" />
                    ) : (
                      <ChevronDown className="w-4 h-4 ml-1" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => setShowCreateDialog(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-wine-600 hover:bg-wine-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wine-500"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Admin
                  </button>
                </div>
              </div>

              {/* Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden mb-6"
                  >
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Status
                          </label>
                          <div className="flex space-x-2">
                            {['all', 'active', 'inactive'].map((status) => (
                              <button
                                key={status}
                                onClick={() => setSelectedStatus(status as any)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md ${
                                  selectedStatus === status
                                    ? 'bg-wine-100 dark:bg-wine-900/30 text-wine-700 dark:text-wine-300 border border-wine-200 dark:border-wine-800'
                                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                                }`}
                              >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Admin List */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                {isLoading ? (
                  <div className="p-8 flex justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-wine-600"></div>
                  </div>
                ) : filteredAdmins.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                      <Users className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                      No admins found
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {searchTerm ? 'Try adjusting your search or filters' : 'Add your first admin to get started'}
                    </p>
                    {!searchTerm && (
                      <button
                        onClick={() => setShowCreateDialog(true)}
                        className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-wine-600 hover:bg-wine-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wine-500"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Admin
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Admin
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Role
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Created
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody ref={parent} className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {filteredAdmins.map((admin) => (
                            <React.Fragment key={admin._id}>
                              <tr className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center text-white font-medium">
                                      {admin.username ? admin.username.charAt(0).toUpperCase() : 'A'}
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {admin.username || 'Unnamed Admin'}
                                      </div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {admin.email}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white capitalize">
                                  {admin.role}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div 
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                                    style={{ 
                                      backgroundColor: statusVariants[admin.accountStatus].backgroundColor,
                                      color: statusVariants[admin.accountStatus].color 
                                    }}
                                  >
                                    {statusVariants[admin.accountStatus].icon}
                                    {admin.accountStatus.charAt(0).toUpperCase() + admin.accountStatus.slice(1)}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(admin.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button
                                    onClick={() => setSelectedAdmin(selectedAdmin === admin._id ? null : admin._id)}
                                    className="text-wine-600 hover:text-wine-900 dark:text-wine-400 dark:hover:text-wine-300"
                                  >
                                    <MoreVertical className="w-5 h-5" />
                                  </button>
                                </td>
                              </tr>
                              
                              {/* Expanded Row */}
                              <AnimatePresence>
                                {selectedAdmin === admin._id && (
                                  <motion.tr
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <td colSpan={5} className="px-6 py-4 bg-gray-50 dark:bg-gray-750">
                                      <div className="flex flex-wrap gap-2">
                                        <button
                                          onClick={() => handleToggleStatus(admin._id)}
                                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wine-500"
                                        >
                                          {admin.accountStatus === 'active' ? (
                                            <>
                                              <X className="w-3.5 h-3.5 mr-1.5" />
                                              Deactivate
                                            </>
                                          ) : (
                                            <>
                                              <Check className="w-3.5 h-3.5 mr-1.5" />
                                              Activate
                                            </>
                                          )}
                                        </button>
                                        
                                        <button
                                          onClick={() => handleDeleteAdmin(admin._id)}
                                          className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                        >
                                          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                          Delete
                                        </button>
                                      </div>
                                    </td>
                                  </motion.tr>
                                )}
                              </AnimatePresence>
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                      <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                        <div className="flex-1 flex justify-between sm:hidden">
                          <button
                            onClick={handlePreviousPage}
                            disabled={!pagination || pagination.page === 1}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${!pagination || pagination.page === 1 ? 'text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                          >
                            Previous
                          </button>
                          <button
                            onClick={handleNextPage}
                            disabled={!pagination || !pagination.hasMore}
                            className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${!pagination || !pagination.hasMore ? 'text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                          >
                            Next
                          </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              Showing <span className="font-medium">{pagination && ((pagination.page - 1) * pagination.limit + 1)}</span> to{' '}
                              <span className="font-medium">
                                {pagination && Math.min(pagination.page * pagination.limit, pagination.total)}
                              </span>{' '}
                              of <span className="font-medium">{pagination && pagination.total}</span> results
                            </p>
                          </div>
                          <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                              <button
                                onClick={handlePreviousPage}
                                disabled={!pagination || pagination.page === 1}
                                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 text-sm font-medium ${!pagination || pagination.page === 1 ? 'text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800' : 'text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                              >
                                <span className="sr-only">Previous</span>
                                <ChevronDown className="h-5 w-5 rotate-90" />
                              </button>
                              
                              {/* Page numbers would go here */}
                              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">
                                {pagination ? `${pagination.page} / ${pagination.totalPages}` : '0 / 0'}
                              </span>
                              
                              <button
                                onClick={handleNextPage}
                                disabled={!pagination || !pagination.hasMore}
                                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 text-sm font-medium ${!pagination || !pagination.hasMore ? 'text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800' : 'text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                              >
                                <span className="sr-only">Next</span>
                                <ChevronDown className="h-5 w-5 -rotate-90" />
                              </button>
                            </nav>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Create Admin Dialog */}
      <AnimatePresence>
        {showCreateDialog && (
          <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowCreateDialog(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden w-full max-w-md mx-auto">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Admin</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-wine-500 focus:border-wine-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="admin@example.com"
                      value={newAdminData.email}
                      onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="username"
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-wine-500 focus:border-wine-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="johndoe"
                      value={newAdminData.username}
                      onChange={(e) => setNewAdminData({ ...newAdminData, username: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-wine-500 focus:border-wine-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="••••••••"
                      value={newAdminData.password}
                      onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Role
                    </label>
                    <select
                      id="role"
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-wine-500 focus:border-wine-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={newAdminData.role}
                      onChange={(e) => setNewAdminData({ ...newAdminData, role: e.target.value })}
                    >
                      <option value="admin">Admin</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateDialog(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wine-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateAdmin}
                    disabled={isCreatingAdmin}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-wine-600 hover:bg-wine-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wine-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isCreatingAdmin && (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    Create Admin
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Snackbar for notifications */}
      <Snackbar
        isOpen={snackbar.isOpen}
        message={snackbar.message}
        type={snackbar.type}
        onClose={closeSnackbar}
      />
    </div>
  );
};

export default AdminManagement;