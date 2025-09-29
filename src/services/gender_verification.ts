import { API_BASE_URL } from '../config';
import { getToken } from '../utils/token';

export interface GVUserInfo {
  _id: string;
  displayName: string;
  email: string;
}

export interface GenderVerificationItem {
  id: string;
  user: GVUserInfo;
  media: string; // single URL per backend response
  status: string; // pending (per backend for now)
  createdAt: string;
  updatedAt: string;
}

export interface GenderVerificationsResponse {
  message: string;
  data: GenderVerificationItem[];
}

export const genderVerificationService = {
  async getAll(): Promise<GenderVerificationsResponse> {
    const token = getToken();
    if (!token) throw new Error('Authentication required');

    const response = await fetch(`${API_BASE_URL}/admin/all-gender-verifications`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(json?.message || 'Failed to fetch gender verifications');
    }

    return json as GenderVerificationsResponse;
  },

  async accept(id: string, userId: string): Promise<{ message?: string }> {
    const token = getToken();
    if (!token) throw new Error('Authentication required');

    const res = await fetch(`${API_BASE_URL}/admin/accept-gender-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ id, userId }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json?.message || 'Failed to accept verification');
    }
    return json;
  },

  async reject(id: string, userId: string): Promise<{ message?: string }> {
    const token = getToken();
    if (!token) throw new Error('Authentication required');

    const res = await fetch(`${API_BASE_URL}/admin/reject-gender-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ id, userId }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json?.message || 'Failed to reject verification');
    }
    return json;
  },
};

export default genderVerificationService;
