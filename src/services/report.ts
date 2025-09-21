import { API_BASE_URL } from '../config';
import { getToken } from '../utils/token';

export interface PostReport {
  _id: string;
  title: string;
  media: {
    metadata: {
      isProcessed: boolean;
    };
    type: string;
    url: string;
    size: number;
  }[];
  reportCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PostReportsResponse {
  message: string;
  data: PostReport[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export const reportService = {
  /**
   * Fetch all post reports with pagination
   */
  async getPostReports(page: number = 1, limit: number = 20) {
    try {
      const token = getToken();
      if (!token) throw new Error('Authentication required');

      const response = await fetch(`${API_BASE_URL}/admin/get-post-reports?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to fetch post reports');
      }

      const data: PostReportsResponse = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Delete a post by ID
   */
  async deletePost(postId: string) {
    try {
      const token = getToken();
      if (!token) throw new Error('Authentication required');

      const response = await fetch(`${API_BASE_URL}/admin/delete-post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ postId })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to delete post');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },
};