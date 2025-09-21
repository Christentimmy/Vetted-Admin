import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../services/auth';
import { dashboardService } from '../services/dashboard';
import type { RecentLookup } from '../services/dashboard';
import { 
  Search, 
  Bell, 
  User, 
  Settings, 
  Moon, 
  Sun, 
  Menu, 
  X,
  Home,
  Phone,
  Users,
  Shield,
  BarChart3,
  FileText,
  DollarSign,
  Eye,
  ChevronDown,
  Filter
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  todaySearches: number;
  totalPosts: number;
  totalActiveSubscriptions: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState('All');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentLookups, setRecentLookups] = useState<RecentLookup[]>([]);
  const [tableError] = useState<string | null>(null);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [statsData, lookupsData] = await Promise.all([
          dashboardService.getDashboardStats(),
          dashboardService.getRecentLookups()
        ]);
        setStats(statsData);
        setRecentLookups(lookupsData);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
        setIsTableLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Logout handler - will be used when implementing logout functionality
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    { icon: Home, label: 'Dashboard', active: true, path: '/dashboard' },
    { icon: Phone, label: 'Phone Lookup', active: false, path: '/phone-lookup' },
    { icon: Users, label: 'User Management', active: false, path: '/users' },
    { icon: BarChart3, label: 'Analytics', active: false, path: '/analytics' },
    { icon: Shield, label: 'Security', active: false, path: '/security' },
    { icon: FileText, label: 'Reports', active: false, path: '/reports' }
  ] as const;
  
  // Get the current path to determine active nav item
  const location = useLocation();
  const currentPath = location.pathname;

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
              {/* Dashboard Header */}
              <div className="mb-6 sm:mb-8">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Dashboard Overview</h1>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">Monitor your platform's key metrics and recent activity</p>
              </div>

              {/* Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
                {isLoading ? (
                  // Loading state
                  Array(4).fill(0).map((_, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                    </div>
                  ))
                ) : error ? (
                  // Error state
                  <div className="col-span-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-6">
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                  </div>
                ) : stats ? (
                  // Success state
                  <>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {stats.totalUsers.toLocaleString()}
                          </p>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                          <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Searches</p>
                          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {stats.todaySearches.toLocaleString()}
                          </p>
                        </div>
                        <div className="p-3 bg-wine-50 dark:bg-wine-900/30 rounded-lg">
                          <Eye className="w-6 h-6 text-wine-600 dark:text-wine-400" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Posts</p>
                          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {stats.totalPosts.toLocaleString()}
                          </p>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                          <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Subscriptions</p>
                          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {stats.totalActiveSubscriptions.toLocaleString()}
                          </p>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                          <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>

              {/* Recent Lookups Table */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Lookups</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Recently performed phone number lookups</p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex space-x-3">
                      <div className="relative">
                        <select
                          value={selectedRiskFilter}
                          onChange={(e) => setSelectedRiskFilter(e.target.value)}
                          className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                        >
                          <option>All</option>
                          <option>Low</option>
                          <option>Medium</option>
                          <option>High</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                      <button className="flex items-center px-4 py-2 bg-wine-600 text-white rounded-lg hover:bg-wine-700 transition-colors text-sm font-medium">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto -mx-3 sm:mx-0">
                  {isTableLoading ? (
                    <div className="p-4 sm:p-6">
                      {Array(5).fill(0).map((_, index) => (
                        <div key={index} className="animate-pulse flex space-x-4 mb-4">
                          <div className="flex-1 space-y-3 py-1">
                            <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                            <div className="space-y-2">
                              <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : tableError ? (
                    <div className="p-6 text-red-600 dark:text-red-400">{tableError}</div>
                  ) : recentLookups.length === 0 ? (
                    <div className="p-6 text-sm sm:text-base text-center text-gray-500 dark:text-gray-400">
                      No recent lookups found
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Lookups</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <colgroup>
                            <col className="w-[30%]" />
                            <col className="w-[25%]" />
                            <col className="w-[20%]" />
                            <col className="w-[25%]" />
                          </colgroup>
                          <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                                Phone Number
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                                User
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                                Results
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                                Lookup Date
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {recentLookups.map((lookup) => (
                              <tr key={lookup._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                                  {lookup.query.phone}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {lookup.userId?.displayName || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex">
                                    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      lookup.resultCount > 0 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                    }`}>
                                      {lookup.resultCount} {lookup.resultCount === 1 ? 'result' : 'results'}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(lookup.createdAt).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {recentLookups.length === 0 && !isTableLoading && !tableError && (
                  <div className="text-center py-12">
                    <Search className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No recent lookups found.</p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
