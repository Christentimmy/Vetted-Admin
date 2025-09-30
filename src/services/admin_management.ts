import { API_BASE_URL } from '../config';

export interface Admin {
  _id: string;
  email: string;
  username: string;
  role: 'admin' | 'superadmin';
  accountStatus: 'active' | 'inactive';
  permissions: string[];
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

export interface AdminsResponse {
  message: string;
  data: Admin[];
  pagination: PaginationInfo;
}

export interface CreateAdminRequest {
  email: string;
  username: string;
  password: string;
  role: 'admin' | 'superadmin';
  permissions: string[];
}

export const adminManagementService = {
  /**
   * Fetch all admins with pagination
   * @param page - Page number to fetch
   * @returns Promise with admins data and pagination info
   */
  async getAllAdmins(page: number = 1): Promise<AdminsResponse> {
    try {
      const token = localStorage.getItem('vetted_admin_token');
      const response = await fetch(`${API_BASE_URL}/admin/all-admins?page=${page}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch admins');
      }

      const result: AdminsResponse = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching admins:', error);
      throw error;
    }
  },

  /**
   * Toggle account status for an admin
   * @param userId - ID of the admin to toggle status
   * @returns Promise<void>
   */
  async toggleAdminStatus(userId: string): Promise<void> {
    try {
      const token = localStorage.getItem('vetted_admin_token');
      const response = await fetch(`${API_BASE_URL}/admin/toggle-active`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to toggle admin status');
      }
    } catch (error) {
      console.error('Error toggling admin status:', error);
      throw error;
    }
  },

  /**
   * Delete an admin
   * @param userId - ID of the admin to delete
   * @returns Promise<void>
   */
  async deleteAdmin(userId: string): Promise<void> {
    try {
      const token = localStorage.getItem('vetted_admin_token');
      const response = await fetch(`${API_BASE_URL}/admin/delete-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete admin');
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      throw error;
    }
  },

  /**
   * Create a new admin
   * @param adminData - Admin data including email, username, password, role, and permissions
   * @returns Promise with the created admin
   */
  async createAdmin(adminData: CreateAdminRequest): Promise<Admin> {
    try {
      const token = localStorage.getItem('vetted_admin_token');
      // Only send the keys the backend expects: email, password, username, role
      const payload = {
        email: adminData.email,
        password: adminData.password,
        username: adminData.username,
        role: (adminData.role === 'superadmin' ? 'super_admin' : adminData.role) ?? 'admin',
      } as const;

      const response = await fetch(`${API_BASE_URL}/admin/create-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create admin');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error creating admin:', error);
      throw error;
    }
  }
};

export default adminManagementService;