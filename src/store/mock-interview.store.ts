import { create } from 'zustand'
import { API_BASE_URL } from '@/config/api'

interface MockInterviewState {
  isLoading: boolean
  error: string | null

  getMockQuestions: (difficulty: string) => Promise<{
    success: boolean
    message: string
    result?: any
  }>

  submitMockAnswers: (difficulty: string, answers: any[]) => Promise<{
    success: boolean
    message: string
    result?: any
  }>

  getMockFeedbackByAttemptId: (attemptId: string) => Promise<{
    success: boolean
    message: string
    result?: any
  }>
  getOverallFeedback: () => Promise<{
    success: boolean
    message: string
    result?: any
  }>
}

export const useMockInterviewStore = create<MockInterviewState>((set) => ({
  isLoading: false,
  error: null,

  getMockQuestions: async (difficulty: string) => {

    set({ isLoading: true });
    try {
      const response = await fetch(`${API_BASE_URL}/mock-interview/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionStorage.getItem('token')}` },

        body: JSON.stringify({ difficulty })
      })
      const result = await response.json()
      // If questions is a string, parse it
      if (result.result && typeof result.result.questions === 'string') {
        try {
          result.result.questions = JSON.parse(result.result.questions.replace(/\n/g, ''));
        } catch (e) {
          console.error('Failed to parse questions:', e);
        }
      }
      return result
    }
    catch (error) {
      console.error('Error fetching mock questions:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },



  submitMockAnswers: async (difficulty: string, answers: any[]) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_BASE_URL}/mock-interview/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify({
          difficulty,
          answers
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit answers');
      }

      return result;
    } catch (error) {
      console.error('Error submitting answers:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  getMockFeedbackByAttemptId: async (attemptId: string) => {
    set({ isLoading: true });
    try {
      const token = sessionStorage.getItem('token');
      console.log('[API] Fetching feedback for attempt:', attemptId, 'Token exists:', !!token);
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const response = await fetch(`${API_BASE_URL}/mock-interview/feedback/${attemptId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('[API] Response status:', response.status);
      const result = await response.json();
      
      if (!response.ok) {
        console.error('[API] Error response:', result);
        throw new Error(result.message || 'Failed to fetch mock feedback');
      }
      
      console.log('[API] Success:', result);
      return result;
    } catch (error) {
      console.error('Error fetching mock feedback:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  // 🔹 Fetch overall feedback
  getOverallFeedback: async () => {
    set({ isLoading: true });
    try {
      const token = sessionStorage.getItem('token');
      console.log('[API] Fetching overall feedback. Token exists:', !!token);
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const response = await fetch(`${API_BASE_URL}/mock-interview/overall-feedback`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('[API] Response status:', response.status);
      const result = await response.json();

      if (!response.ok) {
        console.error('[API] Error response:', result);
        throw new Error(result.message || 'Failed to fetch overall feedback');
      }

      console.log('[API] Success:', result);
      return result;
    } catch (error: any) {
      console.error('Error fetching overall feedback:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  }

}))
