import { API_BASE_URL } from '../config';

export interface Subscription {
  _id: string;
  userId: {
    _id: string;
    displayName: string;
    email: string;
  };
  planType: 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  price: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionStats {
  subscription: number;
  activeSubscription: number;
  canceledSubscription: number;
  pastDueSubscription: number;
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
      const response = await fetch(`${API_BASE_URL}/admin/subscriptions?page=${page}`, {
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
   * @param subscriptionId - ID of the subscription to cancel
   * @returns Promise<void>
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      const token = localStorage.getItem('vetted_admin_token');
      const response = await fetch(`${API_BASE_URL}/admin/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subscriptionId })
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
  }
};

export default subscriptionService;