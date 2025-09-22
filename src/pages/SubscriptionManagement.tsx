import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Search, 
  User, 
  X, 
  Bell,
  Moon,
  Sun,
  Menu,
  Home,
  Users,
  
  Shield,
  FileText,
  CreditCard,
  Zap,
  Crown,
  Building,
  RefreshCw,
  Plus,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  Ban
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { authService } from '../services/auth';
import { subscriptionService, type Subscription, type SubscriptionStats, type PaginationInfo } from '../services/subscription';
import Snackbar from '../components/Snackbar';
import InvoiceHistoryDialog from '../components/InvoiceHistoryDialog';
import { useDashboardLayout } from '../components/DashboardLayoutContext';

const SubscriptionManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const layout = useDashboardLayout();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'inactive' | 'cancelled' | 'expired' | 'all'>('all');
  const [selectedPlan, setSelectedPlan] = useState<string>('all');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    hasMore: false
  });
  const [snackbar, setSnackbar] = useState<{
    isOpen: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    isOpen: false,
    message: '',
    type: 'success'
  });
  const [sortField, setSortField] = useState<'userName' | 'planType' | 'status' | 'price' | 'endDate'>('endDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [invoiceDialog, setInvoiceDialog] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
  }>({
    isOpen: false,
    userId: '',
    userName: ''
  });
  const [cancellingSubscriptions, setCancellingSubscriptions] = useState<Set<string>>(new Set());
  const [parent] = useAutoAnimate();

  const getPlanIcon = (planName: string) => {
    const plan = planName.toLowerCase();
    if (plan.includes('basic') || plan.includes('starter')) return <Zap className="w-4 h-4" />;
    if (plan.includes('pro') || plan.includes('premium')) return <Crown className="w-4 h-4" />;
    if (plan.includes('enterprise') || plan.includes('business')) return <Building className="w-4 h-4" />;
    return <CreditCard className="w-4 h-4" />;
  };

  const getPlanColor = (planName: string) => {
    const plan = planName.toLowerCase();
    if (plan.includes('basic') || plan.includes('starter')) return 'from-blue-500 to-cyan-600';
    if (plan.includes('pro') || plan.includes('premium')) return 'from-purple-500 to-indigo-600';
    if (plan.includes('enterprise') || plan.includes('business')) return 'from-emerald-500 to-teal-600';
    return 'from-gray-500 to-gray-600';
  };

  const statusColors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    expired: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    past_due: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
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

  // Navigation items for the sidebar
  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: CreditCard, label: 'Subscriptions', path: '/subscriptions' },
    { icon: Users, label: 'User Management', path: '/users' },
    { icon: Shield, label: 'Security', path: '/security' },
    { icon: FileText, label: 'Reports', path: '/reports' }
  ] as const;
  
  // Get the current path to determine active nav item
  const currentPath = location.pathname;

  // Fetch subscriptions from real API
  const fetchSubscriptions = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const result = await subscriptionService.getAllSubscriptions(page);
      setSubscriptions(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError('Failed to load subscriptions');
      console.error('Error fetching subscriptions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch subscription stats
  const fetchStats = async () => {
    try {
      setIsStatsLoading(true);
      const result = await subscriptionService.getSubscriptionStats();
      setStats(result.data);
    } catch (err) {
      console.error('Error fetching subscription stats:', err);
    } finally {
      setIsStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    fetchStats();
  }, []);

  const filteredAndSortedSubscriptions = useMemo(() => {
    let filtered = subscriptions.filter(subscription => {
      const matchesSearch = searchTerm === '' || 
        subscription.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subscription.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatus === 'all' || subscription.status === selectedStatus;
      const matchesPlan = selectedPlan === 'all' || subscription.planName.toLowerCase() === selectedPlan;
      
      return matchesSearch && matchesStatus && matchesPlan;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'userName':
          aValue = a.displayName.toLowerCase();
          bValue = b.displayName.toLowerCase();
          break;
        case 'planType':
          aValue = a.planName.toLowerCase();
          bValue = b.planName.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'price':
          // Since price is not available in the new structure, sort by plan name instead
          aValue = a.planName.toLowerCase();
          bValue = b.planName.toLowerCase();
          break;
        case 'endDate':
          aValue = new Date(a.currentPeriodEnd).getTime();
          bValue = new Date(b.currentPeriodEnd).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [subscriptions, searchTerm, selectedStatus, selectedPlan, sortField, sortDirection]);

  const handleSort = (field: 'userName' | 'planType' | 'status' | 'price' | 'endDate') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handlePreviousPage = () => {
    if (pagination.page > 1) {
      fetchSubscriptions(pagination.page - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.hasMore) {
      fetchSubscriptions(pagination.page + 1);
    }
  };

  const handleCancelSubscription = async (userId: string) => {
    try {
      setCancellingSubscriptions(prev => new Set(prev).add(userId));
      await subscriptionService.cancelSubscription(userId);
      setSubscriptions(prev => 
        prev.map(sub => 
          sub.userId === userId 
            ? { ...sub, status: 'cancelled' as const }
            : sub
        )
      );
      showSnackbar('Subscription cancelled successfully!', 'success');
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      showSnackbar('Failed to cancel subscription. Please try again.', 'error');
    } finally {
      setCancellingSubscriptions(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
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

  const handleViewInvoiceHistory = (userId: string, userName: string) => {
    setInvoiceDialog({
      isOpen: true,
      userId,
      userName
    });
  };

  const closeInvoiceDialog = () => {
    setInvoiceDialog({
      isOpen: false,
      userId: '',
      userName: ''
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };


  if (isLoading && !layout?.isInLayout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wine-600"></div>
      </div>
    );
  }

  if (layout?.isInLayout) {
    return (
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Subscriptions</h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Manage and monitor all subscription plans</p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => fetchSubscriptions()}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-wine-600 rounded-lg hover:bg-wine-700">
                <Plus className="w-4 h-4 mr-2" />
                New Subscription
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 p-4 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isStatsLoading ? (
            Array(4).fill(0).map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            ))
          ) : stats ? (
            <>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Subscriptions</p>
                    <p className="text-3xl font-bold">
                      {stats.subscription.toLocaleString()}
                    </p>
                    <p className="text-blue-100 text-xs mt-1">All time</p>
                  </div>
                  <CreditCard className="w-8 h-8 text-blue-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Active</p>
                    <p className="text-3xl font-bold">
                      {stats.activeSubscription.toLocaleString()}
                    </p>
                    <p className="text-green-100 text-xs mt-1">
                      {stats.subscription > 0 ? ((stats.activeSubscription / stats.subscription) * 100).toFixed(1) : 0}% of total
                    </p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">Canceled</p>
                    <p className="text-3xl font-bold">
                      {stats.canceledSubscription.toLocaleString()}
                    </p>
                    <p className="text-red-100 text-xs mt-1">
                      {stats.subscription > 0 ? ((stats.canceledSubscription / stats.subscription) * 100).toFixed(1) : 0}% of total
                    </p>
                  </div>
                  <X className="w-8 h-8 text-red-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Past Due</p>
                    <p className="text-3xl font-bold">
                      {stats.pastDueSubscription.toLocaleString()}
                    </p>
                    <p className="text-orange-100 text-xs mt-1">
                      {stats.subscription > 0 ? ((stats.pastDueSubscription / stats.subscription) * 100).toFixed(1) : 0}% of total
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-200" />
                </div>
              </div>
            </>
          ) : null}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <select
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>

              <select
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
              >
                <option value="all">All Plans</option>
                {Array.from(new Set(subscriptions.map(sub => sub.planName))).map(planName => (
                  <option key={planName} value={planName.toLowerCase()}>{planName}</option>
                ))}
              </select>

                <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('table')}
                    className={`px-3 py-2 text-xs sm:text-sm font-medium ${
                    viewMode === 'table'
                      ? 'bg-wine-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                    className={`px-3 py-2 text-xs sm:text-sm font-medium ${
                    viewMode === 'cards'
                      ? 'bg-wine-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  Cards
                </button>
              </div>
            </div>
          </div>
        </div>

        {viewMode === 'table' ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('userName')}
                        className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        <span>Customer</span>
                        {sortField === 'userName' && (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        )}
                      </button>
                    </th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('planType')}
                        className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        <span>Plan</span>
                        {sortField === 'planType' && (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        )}
                      </button>
                    </th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('status')}
                        className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        <span>Status</span>
                        {sortField === 'status' && (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        )}
                      </button>
                    </th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('price')}
                        className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        <span>Phone</span>
                        {sortField === 'price' && (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('endDate')}
                        className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        <span>Expires</span>
                        {sortField === 'endDate' && (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700" ref={parent}>
                  {filteredAndSortedSubscriptions.length > 0 ? (
                    filteredAndSortedSubscriptions.map((subscription) => (
                      <motion.tr
                        key={subscription.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                        onClick={() => handleViewInvoiceHistory(subscription.userId, subscription.displayName)}
                      >
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white bg-gradient-to-br ${getPlanColor(subscription.planName)}`}>
                              {getPlanIcon(subscription.planName)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {subscription.displayName}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {subscription.email || subscription.phoneNumber}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {subscription.planName}
                            </span>
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[subscription.status]}`}>
                            {subscription.status === 'active' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {subscription.status === 'cancelled' && <X className="w-3 h-3 mr-1" />}
                            {subscription.status === 'expired' && <Clock className="w-3 h-3 mr-1" />}
                            {subscription.status === 'inactive' && <Ban className="w-3 h-3 mr-1" />}
                            {subscription.status === 'past_due' && <Clock className="w-3 h-3 mr-1" />}
                            {subscription.status}
                          </span>
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {subscription.phoneNumber}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(subscription.currentPeriodEnd)}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {subscription.status === 'active' && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelSubscription(subscription.userId);
                              }}
                              disabled={cancellingSubscriptions.has(subscription.userId)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {cancellingSubscriptions.has(subscription.userId) ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-600"></div>
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <CreditCard className="w-12 h-12 text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No subscriptions found</h3>
                          <p className="text-gray-500 dark:text-gray-400">
                            {searchTerm || selectedStatus !== 'all' || selectedPlan !== 'all'
                              ? 'Try adjusting your search or filter criteria'
                              : 'No subscriptions in the system yet'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" ref={parent}>
            {filteredAndSortedSubscriptions.length > 0 ? (
              filteredAndSortedSubscriptions.map((subscription) => (
                <motion.div
                  key={subscription.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleViewInvoiceHistory(subscription.userId, subscription.displayName)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white bg-gradient-to-br ${getPlanColor(subscription.planName)}`}>
                        {getPlanIcon(subscription.planName)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {subscription.displayName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {subscription.email || subscription.phoneNumber}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[subscription.status]}`}>
                      {subscription.status}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Plan</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {subscription.planName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Phone</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {subscription.phoneNumber}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Expires</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(subscription.currentPeriodEnd)}
                      </span>
                    </div>
                  </div>
                  {subscription.status === 'active' && (
                    <div className="mt-4 pt-4 border-top border-gray-200 dark:border-gray-700 flex justify-end">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelSubscription(subscription.userId);
                        }}
                        disabled={cancellingSubscriptions.has(subscription.userId)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cancellingSubscriptions.has(subscription.userId) ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-600"></div>
                            <span className="text-sm">Cancelling...</span>
                          </div>
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center">
                <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No subscriptions found</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm || selectedStatus !== 'all' || selectedPlan !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'No subscriptions in the system yet'}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-8">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
            <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
            <span className="font-medium">{pagination.total}</span> subscriptions
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

        <Snackbar
          isOpen={snackbar.isOpen}
          onClose={closeSnackbar}
          message={snackbar.message}
          type={snackbar.type}
          duration={4000}
        />
        <InvoiceHistoryDialog
          isOpen={invoiceDialog.isOpen}
          onClose={closeInvoiceDialog}
          userId={invoiceDialog.userId}
          userName={invoiceDialog.userName}
        />
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
              <div className="w-8 h-8 bg-wine-600 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img
                  src="/logo.png"
                  alt="Vetted"
                  className="w-5 h-5 object-contain"
                  style={{ filter: 'brightness(0) invert(1)' }}
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <span className="ml-3 text-xl font-semibold text-gray-900 dark:text-white truncate">Vetted</span>
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
            {navItems.map((item) => (
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
                  placeholder="Search subscriptions..."
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
              {/* Page Header with Actions */}
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Subscriptions</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Manage and monitor all subscription plans</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => fetchSubscriptions()}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </button>
                    <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-wine-600 rounded-lg hover:bg-wine-700">
                      <Plus className="w-4 h-4 mr-2" />
                      New Subscription
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 p-4 rounded-lg flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {error}
                </div>
              )}

              {/* Stats Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {isStatsLoading ? (
                  Array(4).fill(0).map((_, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                    </div>
                  ))
                ) : stats ? (
                  <>
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm font-medium">Total Subscriptions</p>
                          <p className="text-3xl font-bold">
                            {stats.subscription.toLocaleString()}
                          </p>
                          <p className="text-blue-100 text-xs mt-1">All time</p>
                        </div>
                        <CreditCard className="w-8 h-8 text-blue-200" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm font-medium">Active</p>
                          <p className="text-3xl font-bold">
                            {stats.activeSubscription.toLocaleString()}
                          </p>
                          <p className="text-green-100 text-xs mt-1">
                            {stats.subscription > 0 ? ((stats.activeSubscription / stats.subscription) * 100).toFixed(1) : 0}% of total
                          </p>
                        </div>
                        <CheckCircle2 className="w-8 h-8 text-green-200" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-red-100 text-sm font-medium">Canceled</p>
                          <p className="text-3xl font-bold">
                            {stats.canceledSubscription.toLocaleString()}
                          </p>
                          <p className="text-red-100 text-xs mt-1">
                            {stats.subscription > 0 ? ((stats.canceledSubscription / stats.subscription) * 100).toFixed(1) : 0}% of total
                          </p>
                        </div>
                        <X className="w-8 h-8 text-red-200" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-100 text-sm font-medium">Past Due</p>
                          <p className="text-3xl font-bold">
                            {stats.pastDueSubscription.toLocaleString()}
                          </p>
                          <p className="text-orange-100 text-xs mt-1">
                            {stats.subscription > 0 ? ((stats.pastDueSubscription / stats.subscription) * 100).toFixed(1) : 0}% of total
                          </p>
                        </div>
                        <Clock className="w-8 h-8 text-orange-200" />
                      </div>
                    </div>
                  </>
                ) : null}
              </div>

              {/* Filters and Controls */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="flex gap-3">
                    <select
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as any)}
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="expired">Expired</option>
                    </select>

                    <select
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                      value={selectedPlan}
                      onChange={(e) => setSelectedPlan(e.target.value)}
                    >
                      <option value="all">All Plans</option>
                      {Array.from(new Set(subscriptions.map(sub => sub.planName))).map(planName => (
                        <option key={planName} value={planName.toLowerCase()}>{planName}</option>
                      ))}
                    </select>

                    <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setViewMode('table')}
                        className={`px-3 py-2 text-sm font-medium ${
                          viewMode === 'table'
                            ? 'bg-wine-600 text-white'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        Table
                      </button>
                      <button
                        onClick={() => setViewMode('cards')}
                        className={`px-3 py-2 text-sm font-medium ${
                          viewMode === 'cards'
                            ? 'bg-wine-600 text-white'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        Cards
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscriptions Table */}
              {viewMode === 'table' ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            <button
                              onClick={() => handleSort('userName')}
                              className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-200"
                            >
                              <span>Customer</span>
                              {sortField === 'userName' && (
                                sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                              )}
                            </button>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            <button
                              onClick={() => handleSort('planType')}
                              className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-200"
                            >
                              <span>Plan</span>
                              {sortField === 'planType' && (
                                sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                              )}
                            </button>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            <button
                              onClick={() => handleSort('status')}
                              className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-200"
                            >
                              <span>Status</span>
                              {sortField === 'status' && (
                                sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                              )}
                            </button>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            <button
                              onClick={() => handleSort('price')}
                              className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-200"
                            >
                              <span>Phone</span>
                              {sortField === 'price' && (
                                sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                              )}
                            </button>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            <button
                              onClick={() => handleSort('endDate')}
                              className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-200"
                            >
                              <span>Expires</span>
                              {sortField === 'endDate' && (
                                sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                              )}
                            </button>
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700" ref={parent}>
                        {filteredAndSortedSubscriptions.length > 0 ? (
                          filteredAndSortedSubscriptions.map((subscription) => (
                            <motion.tr
                              key={subscription.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                              onClick={() => handleViewInvoiceHistory(subscription.userId, subscription.displayName)}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white bg-gradient-to-br ${getPlanColor(subscription.planName)}`}>
                                    {getPlanIcon(subscription.planName)}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {subscription.displayName}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {subscription.email || subscription.phoneNumber}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {subscription.planName}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[subscription.status]}`}>
                                  {subscription.status === 'active' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                  {subscription.status === 'cancelled' && <X className="w-3 h-3 mr-1" />}
                                  {subscription.status === 'expired' && <Clock className="w-3 h-3 mr-1" />}
                                  {subscription.status === 'inactive' && <Ban className="w-3 h-3 mr-1" />}
                                  {subscription.status === 'past_due' && <Clock className="w-3 h-3 mr-1" />}
                                  {subscription.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {subscription.phoneNumber}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(subscription.currentPeriodEnd)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {subscription.status === 'active' && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCancelSubscription(subscription.userId);
                                    }}
                                    disabled={cancellingSubscriptions.has(subscription.userId)}
                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {cancellingSubscriptions.has(subscription.userId) ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-600"></div>
                                    ) : (
                                      <X className="w-4 h-4" />
                                    )}
                                  </button>
                                )}
                              </td>
                            </motion.tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center">
                              <div className="flex flex-col items-center">
                                <CreditCard className="w-12 h-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No subscriptions found</h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                  {searchTerm || selectedStatus !== 'all' || selectedPlan !== 'all'
                                    ? 'Try adjusting your search or filter criteria'
                                    : 'No subscriptions in the system yet'}
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* Cards View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" ref={parent}>
                  {filteredAndSortedSubscriptions.length > 0 ? (
                    filteredAndSortedSubscriptions.map((subscription) => (
                      <motion.div
                        key={subscription.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => handleViewInvoiceHistory(subscription.userId, subscription.displayName)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white bg-gradient-to-br ${getPlanColor(subscription.planName)}`}>
                              {getPlanIcon(subscription.planName)}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {subscription.displayName}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {subscription.email || subscription.phoneNumber}
                              </p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[subscription.status]}`}>
                            {subscription.status}
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Plan</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {subscription.planName}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Phone</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {subscription.phoneNumber}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Expires</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatDate(subscription.currentPeriodEnd)}
                            </span>
                          </div>
                        </div>
                        
                        {subscription.status === 'active' && (
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelSubscription(subscription.userId);
                              }}
                              disabled={cancellingSubscriptions.has(subscription.userId)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {cancellingSubscriptions.has(subscription.userId) ? (
                                <div className="flex items-center space-x-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-600"></div>
                                  <span className="text-sm">Cancelling...</span>
                                </div>
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full py-12 text-center">
                      <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No subscriptions found</h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        {searchTerm || selectedStatus !== 'all' || selectedPlan !== 'all'
                          ? 'Try adjusting your search or filter criteria'
                          : 'No subscriptions in the system yet'}
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Pagination */}
              <div className="flex items-center justify-between mt-8">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                  <span className="font-medium">{pagination.total}</span> subscriptions
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
          </main>
        </div>
      </div>

      {/* Snackbar */}
      <Snackbar
        isOpen={snackbar.isOpen}
        onClose={closeSnackbar}
        message={snackbar.message}
        type={snackbar.type}
        duration={4000}
      />

      {/* Invoice History Dialog */}
      <InvoiceHistoryDialog
        isOpen={invoiceDialog.isOpen}
        onClose={closeInvoiceDialog}
        userId={invoiceDialog.userId}
        userName={invoiceDialog.userName}
      />
    </div>
  );
};

export default SubscriptionManagement;