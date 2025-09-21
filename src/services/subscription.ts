import { API_BASE_URL } from '../config';

export interface Subscription {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  phoneNumber: string;
  planName: string;
  currentPeriodEnd: string;
  status: 'active' | 'inactive' | 'cancelled' | 'expired' | 'past_due';
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionStats {
  subscription: number;
  activeSubscription: number;
  canceledSubscription: number;
  pastDueSubscription: number;
}

export interface Invoice {
  id: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed' | 'cancelled';
  created: string;
  subscriptionStatus: string | null;
}

export interface InvoiceHistoryResponse {
  message: string;
  data: Invoice[];
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface SubscriptionsResponse {
  message: string;
  data: Subscription[];
  pagination: PaginationInfo;
}

export interface SubscriptionStatsResponse {
  message: string;
  data: SubscriptionStats;
}

export const subscriptionService = {
  /**
   * Fetch all subscriptions with pagination
   * @param page - Page number to fetch
   * @returns Promise with subscriptions data and pagination info
   */
  async getAllSubscriptions(page: number = 1): Promise<SubscriptionsResponse> {
    try {
      const token = localStorage.getItem('vetted_admin_token');
      const response = await fetch(`${API_BASE_URL}/admin/all-subscriptions?page=${page}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions');
      }

      const result: SubscriptionsResponse = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  },

  /**
   * Fetch subscription statistics
   * @returns Promise with subscription stats
   */
  async getSubscriptionStats(): Promise<SubscriptionStatsResponse> {
    try {
      const token = localStorage.getItem('vetted_admin_token');
      const response = await fetch(`${API_BASE_URL}/admin/subscription-stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscription stats');
      }

      const result: SubscriptionStatsResponse = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching subscription stats:', error);
      throw error;
    }
  },

  /**
   * Cancel a subscription
   * @param userId - ID of the user whose subscription to cancel
   * @returns Promise<void>
   */
  async cancelSubscription(userId: string): Promise<void> {
    try {
      const token = localStorage.getItem('vetted_admin_token');
      const response = await fetch(`${API_BASE_URL}/admin/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  },

  /**
   * Reactivate a subscription
   * @param subscriptionId - ID of the subscription to reactivate
   * @returns Promise<void>
   */
  async reactivateSubscription(subscriptionId: string): Promise<void> {
    try {
      const token = localStorage.getItem('vetted_admin_token');
      const response = await fetch(`${API_BASE_URL}/admin/reactivate-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subscriptionId })
      });

      if (!response.ok) {
        throw new Error('Failed to reactivate subscription');
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw error;
    }
  },

  /**
   * Fetch user invoice history
   * @param userId - ID of the user
   * @returns Promise with invoice history data
   */
  async getUserInvoiceHistory(userId: string): Promise<InvoiceHistoryResponse> {
    try {
      const token = localStorage.getItem('vetted_admin_token');
      const response = await fetch(`${API_BASE_URL}/admin/user-invoice-history/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch invoice history');
      }

      const result: InvoiceHistoryResponse = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching invoice history:', error);
      throw error;
    }
  }
};

export default subscriptionService;