import { useMemo, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Search,
  Moon,
  Sun,
  Menu,
  X,
  Home,
  Users,
  Shield,
  FileText,
  CreditCard,
  Headphones,
  Phone
} from 'lucide-react';
import { authService } from '../services/auth';
import { DashboardLayoutContext } from './DashboardLayoutContext';

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleDarkMode = () => setIsDarkMode((v) => !v);
  const toggleSidebar = () => setIsSidebarOpen((v) => !v);

  const navItems = useMemo(() => ([
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: CreditCard, label: 'Subscriptions', path: '/subscriptions' },
    { icon: Users, label: 'Users', path: '/users' },
    { icon: Shield, label: 'Admins', path: '/admins' },
    { icon: Shield, label: 'Gender', path: '/gender' },
    { icon: Headphones, label: 'Support', path: '/support' },
    { icon: FileText, label: 'Reports', path: '/reports' }
  ]), []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const contextValue = useMemo(() => ({
    isInLayout: true,
    isDarkMode,
    toggleDarkMode,
    isSidebarOpen,
    toggleSidebar,
  }), [isDarkMode, isSidebarOpen]);

  return (
    <DashboardLayoutContext.Provider value={contextValue}>
      <div className={isDarkMode ? 'dark' : ''}>
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-['Inter',sans-serif] overflow-x-hidden">
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
                  onClick={() => {
                    // Close sidebar on navigation for mobile/tablet (< lg)
                    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                      setIsSidebarOpen(false);
                    }
                  }}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    location.pathname === item.path
                      ? 'bg-wine-50 dark:bg-wine-900/30 text-wine-700 dark:text-wine-300 border-r-2 border-wine-600'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              ))}
              <div className="mt-auto mb-6">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </nav>
          </div>

          {isSidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-gray-900/80 backdrop-blur-sm lg:hidden"
              onClick={toggleSidebar}
              aria-hidden="true"
            />
          )}

          <div className="flex-1 flex flex-col overflow-hidden w-full">
            <header className="flex items-center justify-between h-16 px-2 sm:px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
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
              </div>
            </header>
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </DashboardLayoutContext.Provider>
  );
};

export default DashboardLayout;


