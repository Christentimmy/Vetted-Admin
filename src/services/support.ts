import axios from 'axios';
import { API_BASE_URL } from '../config';

export interface SupportTicket {
  _id: string;
  user: {
    _id: string;
    displayName: string;
    avatar: string;
  };
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export const fetchAllTickets = async (): Promise<SupportTicket[]> => {
  try {
    const token = localStorage.getItem('vetted_admin_token');
    const response = await axios.get(`${API_BASE_URL}/support-ticket/all-tickets`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    throw error;
  }
};

export const markTicketAsResolved = async (ticketId: string): Promise<{ success: boolean }> => {
  try {
    const token = localStorage.getItem('vetted_admin_token');
    const response = await axios.post(
      `${API_BASE_URL}/admin/mark-ticket`,
      { id: ticketId },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return { success: true };
  } catch (error) {
    console.error('Error marking ticket as resolved:', error);
    throw error;
  }
};
