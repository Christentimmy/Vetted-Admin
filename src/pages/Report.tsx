import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../services/auth';
import {
  Search,
  Bell,
  User,
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
  CreditCard,
  Download,
  Calendar,
  PieChart,
  BarChart,
  LineChart,
  ChevronDown
} from 'lucide-react';

interface ReportData {
  id: string;
  title: string;
  category: string;
  generatedDate: string;
  downloadCount: number;
  size: string;
}

const Report = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'financial' | 'user' | 'system' | 'all'>('all');
  const [selectedTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [reports, setReports] = useState<ReportData[]>([]);
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Simulated data loading
  useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data
        const mockReports: ReportData[] = [
          {
            id: '1',
            title: 'Monthly Financial Summary',
            category: 'financial',
            generatedDate: '2023-10-01',
            downloadCount: 24,
            size: '1.2 MB'
          },
          {
            id: '2',
            title: 'User Growth Analysis',
            category: 'user',
            generatedDate: '2023-09-28',
            downloadCount: 18,
            size: '3.5 MB'
          },
          {
            id: '3',
            title: 'Revenue Projection Q4',
            category: 'financial',
            generatedDate: '2023-09-25',
            downloadCount: 32,
            size: '2.8 MB'
          },
          {
            id: '4',
            title: 'System Performance Metrics',
            category: 'system',
            generatedDate: '2023-09-22',
            downloadCount: 12,
            size: '4.1 MB'
          },
          {
            id: '5',
            title: 'User Engagement Statistics',
            category: 'user',
            generatedDate: '2023-09-20',
            downloadCount: 27,
            size: '2.3 MB'
          },
          {
            id: '6',
            title: 'Annual Financial Report',
            category: 'financial',
            generatedDate: '2023-09-15',
            downloadCount: 45,
            size: '5.7 MB'
          },
        ];
        
        setReports(mockReports);
      } catch (error) {
        console.error('Failed to load reports:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadReports();
  }, []);

  // Filter reports based on active tab and search term
  const filteredReports = reports.filter(report => {
    const matchesTab = activeTab === report.category || activeTab === 'all';
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Logout handler
  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Navigation items for the sidebar
  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: CreditCard, label: 'Subscriptions', path: '/subscriptions' },
    { icon: Users, label: 'User Management', path: '/users' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Shield, label: 'Security', path: '/security' },
    { icon: FileText, label: 'Reports', path: '/reports' }
  ] as const;
  
  // Get the current path to determine active nav item
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-['Inter',sans-serif] overflow-x-hidden">
        
        {/* Sidebar - Matching Dashboard styling */}
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

        {/* Main Content with a different layout than Dashboard */}
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          {/* Top Bar with different styling */}
          <header className="flex items-center justify-between h-16 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
            {/* Left side - Menu and Title */}
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 lg:hidden"
                aria-label="Toggle menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <h1 className="ml-4 text-xl font-semibold text-gray-800 dark:text-white lg:hidden">Reports</h1>
            </div>

            {/* Right side - Search and Icons */}
            <div className="flex items-center space-x-3">
              <div className="relative max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search reports..."
                  className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
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
              </div>
            </div>
          </header>

          {/* Main Content Area with a different layout */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900">
            <div className="container mx-auto px-4 py-6">
              {/* Report Header with Tabs - Different from Dashboard */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Generate and download detailed reports</p>
                  </div>
                  
                  <div className="mt-4 sm:mt-0 flex items-center space-x-2">
                    <div className="relative">
                      <button className="flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <Calendar className="w-4 h-4 mr-2" />
                        {selectedTimeframe.charAt(0).toUpperCase() + selectedTimeframe.slice(1)}
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </button>
                    </div>
                    
                    <button className="flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-wine-600 hover:bg-wine-700 text-white">
                      <Download className="w-4 h-4 mr-2" />
                      Generate Report
                    </button>
                  </div>
                </div>
                
                {/* Custom Tab Navigation - Different from other pages */}
                <div className="mt-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-8">
                    <button
                      onClick={() => setActiveTab('all')}
                      className={`pb-4 px-1 text-sm font-medium ${activeTab === 'all' ? 'text-wine-600 dark:text-wine-400 border-b-2 border-wine-600 dark:border-wine-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                      All Reports
                    </button>
                    <button
                      onClick={() => setActiveTab('financial')}
                      className={`pb-4 px-1 text-sm font-medium ${activeTab === 'financial' ? 'text-wine-600 dark:text-wine-400 border-b-2 border-wine-600 dark:border-wine-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                      Financial Reports
                    </button>
                    <button
                      onClick={() => setActiveTab('user')}
                      className={`pb-4 px-1 text-sm font-medium ${activeTab === 'user' ? 'text-wine-600 dark:text-wine-400 border-b-2 border-wine-600 dark:border-wine-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                      User Reports
                    </button>
                    <button
                      onClick={() => setActiveTab('system')}
                      className={`pb-4 px-1 text-sm font-medium ${activeTab === 'system' ? 'text-wine-600 dark:text-wine-400 border-b-2 border-wine-600 dark:border-wine-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                      System Reports
                    </button>
                  </div>
                </div>
              </div>

              {/* Report Content - Different layout with cards in a grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  // Loading state
                  Array(6).fill(0).map((_, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                    </div>
                  ))
                ) : filteredReports.length === 0 ? (
                  // Empty state
                  <div className="col-span-full flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <FileText className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No reports found</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {searchTerm ? 'Try adjusting your search term' : 'No reports available for this category'}
                    </p>
                  </div>
                ) : (
                  // Report cards with a different design than Dashboard cards
                  filteredReports.map((report) => {
                    // Determine icon based on category
                    let Icon = FileText;
                    if (report.category === 'financial') Icon = DollarSign;
                    if (report.category === 'user') Icon = Users;
                    if (report.category === 'system') Icon = BarChart3;
                    
                    return (
                      <div 
                        key={report.id} 
                        className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="p-2 rounded-lg bg-wine-50 dark:bg-wine-900/30">
                              <Icon className="w-5 h-5 text-wine-600 dark:text-wine-400" />
                            </div>
                            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                              {report.size}
                            </span>
                          </div>
                          
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{report.title}</h3>
                          
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                            <Calendar className="w-4 h-4 mr-1.5" />
                            <span>Generated on {new Date(report.generatedDate).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <Download className="w-4 h-4 mr-1.5" />
                              <span>{report.downloadCount} downloads</span>
                            </div>
                            
                            <button className="text-wine-600 hover:text-wine-700 dark:text-wine-400 dark:hover:text-wine-300 text-sm font-medium">
                              Download
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              
              {/* Report Generation Section - Unique to this page */}
              <div className="mt-10 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Generate Custom Report</h2>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Report Type
                      </label>
                      <select className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-wine-500 focus:border-transparent">
                        <option>Financial Summary</option>
                        <option>User Activity</option>
                        <option>System Performance</option>
                        <option>Subscription Analytics</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Time Period
                      </label>
                      <select className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-wine-500 focus:border-transparent">
                        <option>Last 7 days</option>
                        <option>Last 30 days</option>
                        <option>Last 90 days</option>
                        <option>Custom range</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Format
                      </label>
                      <select className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-wine-500 focus:border-transparent">
                        <option>PDF</option>
                        <option>Excel</option>
                        <option>CSV</option>
                        <option>JSON</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button className="px-4 py-2 text-sm font-medium rounded-lg bg-wine-600 hover:bg-wine-700 text-white">
                      Generate Report
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Report Visualization Section - Unique to this page */}
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Report Categories</h3>
                    <PieChart className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="h-48 flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Chart visualization would go here</p>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Report Downloads</h3>
                    <BarChart className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="h-48 flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Chart visualization would go here</p>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Report Generation Trend</h3>
                    <LineChart className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="h-48 flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Chart visualization would go here</p>
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

export default Report;