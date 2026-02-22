
import { create } from 'zustand'
import { AppUser } from '@/types'
import { API_BASE_URL } from '@/config/api'


interface UserState {
  user: AppUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  completeProfile: (data: { skills: any[]; experiences: any[]; education: any[]; about: string }) => Promise<{ success: boolean; message: string }>
  updateCompanyProfile: (data: { companyName?: string; industry?: string; website?: string; address?: string; size?: string; founded?: string; description?: string }) => Promise<{ success: boolean; message: string; company?: any }>
  fetchUserDetail: () => Promise<{ success: boolean; message: string; user?: any }>
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,


  completeProfile: async (data: { skills: any[]; experiences: any[]; education: any[]; about: string }) => {
    const token = sessionStorage.getItem('token'); // or sessionStorage
    const userString = sessionStorage.getItem('user');
    if (!userString) {
      return { success: false, message: 'User not found' };
    }
    const user = JSON.parse(userString); // now user is an object

    try {
      const response = await fetch(`${API_BASE_URL}/user/complete-profile/${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        return { success: false, message: result.message || 'Failed to complete profile' };
      }

      return { success: true, message: result.message, data: result.candidate };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  },

  updateCompanyProfile: async (data) => {
    const token = sessionStorage.getItem('token');
    const userString = sessionStorage.getItem('user');

    if (!userString || !token) {
      return { success: false, message: 'User not found' };
    }

    const user = JSON.parse(userString);
    const userId = user.id || user.userId;

    try {
      const response = await fetch(`${API_BASE_URL}/user/company-profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        return { success: false, message: result.message || 'Failed to update company profile' };
      }

      return { success: true, message: result.message, company: result.company };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  },

  fetchUserDetail: async () => {
    const token = sessionStorage.getItem('token');
    const userString = sessionStorage.getItem('user');

    if (!userString || !token) {
      console.log('No user data found');
      return {
        success: false,
        message: 'No user data found',
        user: undefined
      };
    }

    const user = JSON.parse(userString);
    const userId = user.id || user.userId; // handle both key variants
    if (!userId) {
      return { success: false, message: 'User ID not found in session', user: undefined };
    }
    try {

      const response = await fetch(`${API_BASE_URL}/user/profile/${userId}`, {

        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      })

      const result = await response.json()

      if (response.ok) {
        return {
          success: true,
          message: (result.message as string) || 'Profile Fetched successfully',
          user: result.user
        }
      } else {
        return {
          success: false,
          message: (result.message as string) || 'Failed to fetch profile',
          user: undefined
        }
      }
    } catch (error: any) {
      set({ error: error.message })
      return {
        success: false,
        message: (error.message as string) || 'An error occurred while fetching profile',
        user: undefined
      }
    } finally {
      set({ isLoading: false })
    }
  },
}))