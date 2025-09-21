import { API_BASE_URL } from '../config';
import { getToken } from '../utils/token';

export interface UserInfo {
  _id: string;
  displayName: string;
}

export interface RecentLookup {
  _id: string;
  userId: UserInfo;
  query: {
    phone: string;
  };
  resultCount: number;
  createdAt: string;
}

interface DashboardStats {
  totalUsers: number;
  todaySearches: number;
  totalPosts: number;
  totalActiveSubscriptions: number;
}

export const dashboardService = {
  /**
   * Fetches dashboard statistics
   * @returns Promise with dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/dashboard-stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to fetch dashboard stats');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  /**
   * Fetches recent phone number lookups
   * @returns Promise with recent lookups data
   */
  async getRecentLookups(): Promise<RecentLookup[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/recent-looks-ups`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
      });

      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to fetch recent lookups');
      }


      return data.data;
    } catch (error) {
      console.error('Error fetching recent lookups:', error);
      throw error;
    }
  }
};

export default dashboardService;
