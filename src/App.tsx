import React, { useState } from 'react';
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
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Eye,
  Filter,
  ChevronDown
} from 'lucide-react';

interface PhoneRecord {
  id: string;
  phoneNumber: string;
  name: string;
  location: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  date: string;
}

const mockPhoneData: PhoneRecord[] = [
  {
    id: '1',
    phoneNumber: '+1 (555) 123-4567',
    name: 'John Smith',
    location: 'New York, NY',
    riskLevel: 'Low',
    date: '2025-01-08'
  },
  {
    id: '2',
    phoneNumber: '+1 (555) 987-6543',
    name: 'Sarah Johnson',
    location: 'Los Angeles, CA',
    riskLevel: 'Medium',
    date: '2025-01-08'
  },
  {
    id: '3',
    phoneNumber: '+1 (555) 456-7890',
    name: 'Michael Brown',
    location: 'Chicago, IL',
    riskLevel: 'High',
    date: '2025-01-07'
  },
  {
    id: '4',
    phoneNumber: '+1 (555) 321-9876',
    name: 'Emily Davis',
    location: 'Houston, TX',
    riskLevel: 'Low',
    date: '2025-01-07'
  },
  {
    id: '5',
    phoneNumber: '+1 (555) 654-3210',
    name: 'Robert Wilson',
    location: 'Phoenix, AZ',
    riskLevel: 'Medium',
    date: '2025-01-06'
  }
];

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState('All');

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const filteredData = mockPhoneData.filter(record => {
    const matchesSearch = 
      record.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedRiskFilter === 'All' || record.riskLevel === selectedRiskFilter;
    
    return matchesSearch && matchesFilter;
  });

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'High':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const sidebarItems = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: Phone, label: 'Phone Lookup', active: false },
    { icon: Users, label: 'User Management', active: false },
    { icon: BarChart3, label: 'Analytics', active: false },
    { icon: Shield, label: 'Security', active: false },
    { icon: FileText, label: 'Reports', active: false }
  ];

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-['Inter',sans-serif]">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-wine-600 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-semibold text-gray-900 dark:text-white">Tea Admin</span>
            </div>
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <nav className="mt-8 px-4">
            {sidebarItems.map((item, index) => (
              <a
                key={index}
                href="#"
                className={`flex items-center px-4 py-3 mt-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  item.active
                    ? 'bg-wine-50 dark:bg-wine-900/30 text-wine-700 dark:text-wine-300 border-r-2 border-wine-600'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
            onClick={toggleSidebar}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search phone numbers, names..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              
              <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              
              <div className="w-8 h-8 bg-wine-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-6 py-8">
              {/* Dashboard Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard Overview</h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Monitor your platform's key metrics and recent activity</p>
              </div>

              {/* Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">24,563</p>
                      <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +12.5% from last month
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
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Searches</p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">8,942</p>
                      <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +8.2% from yesterday
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
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Flagged Reports</p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">127</p>
                      <p className="text-xs text-red-600 dark:text-red-400 flex items-center mt-1">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        +3 new today
                      </p>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
                      <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">$42,891</p>
                      <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +15.3% this month
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                      <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone Lookup Table */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Phone Number Lookups</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Recent search results and risk assessments</p>
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

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Phone Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Risk Level
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredData.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {record.phoneNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {record.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                            {record.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(record.riskLevel)}`}>
                              {record.riskLevel}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredData.length === 0 && (
                  <div className="text-center py-12">
                    <Search className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No results found for your search.</p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;