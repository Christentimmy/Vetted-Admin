import { API_BASE_URL } from '../config';

export interface User {
  _id: string;
  email: string;
  displayName: string;
  accountStatus: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface UsersResponse {
  message: string;
  data: User[];
  pagination: PaginationInfo;
}

export interface SendMessageRequest {
  email: string;
  recipientName: string;
  message: string;
}

export const userManagementService = {
  /**
   * Fetch all users with pagination
   * @param page - Page number to fetch
   * @returns Promise with users data and pagination info
   */
  async getAllUsers(page: number = 1): Promise<UsersResponse> {
    try {
      const token = localStorage.getItem('vetted_admin_token');
      const response = await fetch(`${API_BASE_URL}/admin/all-users?page=${page}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const result: UsersResponse = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  /**
   * Toggle ban status for a user
   * @param userId - ID of the user to toggle ban status
   * @returns Promise<void>
   */
  async toggleBan(userId: string): Promise<void> {
    try {
      const token = localStorage.getItem('vetted_admin_token');
      const response = await fetch(`${API_BASE_URL}/admin/toggle-ban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle ban status');
      }
    } catch (error) {
      console.error('Error toggling ban status:', error);
      throw error;
    }
  },

  /**
   * Send a message to a user
   * @param messageData - Message data including email, recipient name, and message
   * @returns Promise<void>
   */
  async sendMessage(messageData: SendMessageRequest): Promise<void> {
    try {
      const token = localStorage.getItem('vetted_admin_token');
      const response = await fetch(`${API_BASE_URL}/admin/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
};

export default userManagementService;