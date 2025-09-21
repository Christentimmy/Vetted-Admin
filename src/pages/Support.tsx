import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Headphones, 
  MessageSquare, 
  User, 
  ChevronDown,
  ChevronUp,
  Home,
  Users,
  Shield,
  FileText,
  CreditCard,
  Bell,
  Moon,
  Sun,
  Menu,
  X,
  Phone
} from 'lucide-react';

// Mock data for support tickets
const mockTickets = [
  {
    id: 1,
    user: 'John Doe',
    email: 'john@example.com',
    subject: 'Login issues',
    message: 'I am unable to login to my account.',
    status: 'open',
    date: '2025-09-20',
    priority: 'high'
  },
  {
    id: 2,
    user: 'Jane Smith',
    email: 'jane@example.com',
    subject: 'Payment problem',
    message: 'My payment was not processed correctly.',
    status: 'in-progress',
    date: '2025-09-19',
    priority: 'medium'
  },
  {
    id: 3,
    user: 'Bob Johnson',
    email: 'bob@example.com',
    subject: 'Feature request',
    message: 'Can you add dark mode to the app?',
    status: 'closed',
    date: '2025-09-18',
    priority: 'low'
  }
];

const Support = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Navigation items for the sidebar
  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: CreditCard, label: 'Subscriptions', path: '/subscriptions' },
    { icon: Users, label: 'User Management', path: '/users' },
    { icon: Shield, label: 'Admin Management', path: '/admins' },
    { icon: Headphones, label: 'Support', path: '/support' },
    { icon: FileText, label: 'Reports', path: '/reports' }
  ] as const;
  const [expandedTicket, setExpandedTicket] = useState<number | null>(null);
  
  // Filter tickets (placeholder for future implementation)
  const filteredTickets = mockTickets;

  const toggleTicket = (id: number) => {
    setExpandedTicket(expandedTicket === id ? null : id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">Open</span>;
      case 'in-progress':
        return <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">In Progress</span>;
      case 'closed':
        return <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">Resolved</span>;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-1 text-xs font-medium text-white bg-red-500 rounded-full">High</span>;
      case 'medium':
        return <span className="px-2 py-1 text-xs font-medium text-white bg-yellow-500 rounded-full">Medium</span>;
      case 'low':
        return <span className="px-2 py-1 text-xs font-medium text-white bg-gray-500 rounded-full">Low</span>;
      default:
        return null;
    }
  };

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
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
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

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top navigation */}
          <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center">
                <button
                  onClick={toggleSidebar}
                  className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                  aria-label="Toggle menu"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <h1 className="ml-4 text-xl font-semibold text-gray-900 dark:text-white">Support</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleDarkMode}
                  className="p-2 text-gray-500 rounded-full hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </button>
                
                <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                
                <div className="relative">
                  <button className="flex items-center text-sm rounded-full focus:outline-none">
                    <div className="w-8 h-8 rounded-full bg-wine-600 flex items-center justify-center text-white">
                      <User className="w-5 h-5" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Main content area */}
          <main className="flex-1 overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="px-4 sm:px-6 lg:px-8">
                <div className="p-6">
                  <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Customer Support</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage and respond to customer inquiries and issues</p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    {filteredTickets.length === 0 ? (
                      <div className="p-8 text-center">
                        <Headphones className="w-12 h-12 mx-auto text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No tickets found</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Get started by creating a new ticket
                        </p>
                        <div className="mt-6">
                          <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <MessageSquare className="w-5 h-5 mr-2 -ml-1" />
                            New Ticket
                          </button>
                        </div>
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredTickets.map((ticket) => (
                          <li key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <div 
                              className="flex items-center justify-between px-6 py-4 cursor-pointer"
                              onClick={() => toggleTicket(ticket.id)}
                            >
                              <div className="flex items-center">
                                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                  <User className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                                </div>
                                <div className="ml-4">
                                  <div className="flex items-center space-x-2">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{ticket.user}</p>
                                    <span className="text-xs text-gray-500">•</span>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{ticket.email}</p>
                                  </div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">{ticket.subject}</p>
                                  <div className="flex items-center mt-1 space-x-2">
                                    {getStatusBadge(ticket.status)}
                                    {getPriorityBadge(ticket.priority)}
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {new Date(ticket.date).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center">
                                {expandedTicket === ticket.id ? (
                                  <ChevronUp className="w-5 h-5 text-gray-400" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                            </div>
                            <AnimatePresence>
                              {expandedTicket === ticket.id && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="px-6 pb-4 overflow-hidden"
                                >
                                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{ticket.message}</p>
                                    <div className="flex justify-end mt-4 space-x-2">
                                      <button className="px-3 py-1 text-sm text-white bg-red-500 rounded-md hover:bg-red-600">
                                        Close Ticket
                                      </button>
                                      <button className="px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700">
                                        Respond
                                      </button>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </li>
                        ))}
                      </ul>
                    )}
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

export default Support;
