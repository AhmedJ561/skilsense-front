import { create } from 'zustand'
import { API_BASE_URL } from '@/config/api'

interface CreateInterviewDto {
  jobTitle: string
  requiredSkills: string[]
  location?: string
  salary?: string
  isHired?: boolean
  description?: string
  deadline?: string | null
}


interface InterviewState {
  interviews: any[]
  isLoading: boolean
  error: string | null

  createInterview: (data: CreateInterviewDto) => Promise<{ success: boolean; message: string; interview?: any }>
  updateInterview: (id: string, data: Partial<CreateInterviewDto>) => Promise<{ success: boolean; message: string; interview?: any }>
  deleteInterview: (id: string) => Promise<{ success: boolean; message: string }>

  getInterviewByCompany: () => Promise<{ success: boolean; message: string; interview?: any }>

  findInterview: () => Promise<{ success: boolean; message: string; interview?: any }>
  getInterviewquestions: (interviewId: string) => Promise<{ success: boolean; message: string; result?: any }>

  submitInterviewAnswers: (interviewId: string, answers: any[], snapshots: any[]) => Promise<{ success: boolean; message: string; result?: any }>
  attendInterview: (interviewId: string) => Promise<{ success: boolean; message: string; interviewCandidateId?: any }>
  fetchAttendedInterviews: () => Promise<{ success: boolean; message: string; interview?: any }>
  getCompanyCandidates: () => Promise<{ success: boolean; message: string; candidates?: any[] }>
  getCompanyInterviewCandidates: (interviewId: string) => Promise<{ success: boolean; message: string; candidates?: any[] }>
  getCompanyAnalytics: () => Promise<{ success: boolean; analytics?: any }>
  getInterviewFeedback: (interviewCandidateId: string) => Promise<{ success: boolean; message: string; result?: any }>
  saveSnapshot: (interviewCandidateId: string, type: string, imageBase64: string) => Promise<void>
  getCompanyShortlist: () => Promise<{ success: boolean; message?: string; candidates?: any[] }>
  getInterviewShortlist: (interviewId: string) => Promise<{ success: boolean; message?: string; candidates?: any[] }>
  getCandidateDetail: (id: string) => Promise<{ success: boolean; result?: any }>
  reEvaluateFeedback: (id: string) => Promise<{ success: boolean; message: string; result?: any }>
  markHired: (id: string, isHired: boolean) => Promise<{ success: boolean; message: string }>
  markShortlist: (id: string, shortlisted: boolean) => Promise<{ success: boolean; message: string }>
  deleteCandidate: (id: string) => Promise<{ success: boolean; message: string }>
}

export const useInterviewStore = create<InterviewState>((set) => ({
  interviews: [],
  isLoading: false,
  error: null,

  createInterview: async (data: CreateInterviewDto) => {
    set({ isLoading: true, error: null })
    const token = sessionStorage.getItem('token')
    try {
      const response = await fetch(`${API_BASE_URL}/interviews/post-interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Failed to create interview')
      return { success: true, message: result.message, interview: result.interview }
    } catch (error: any) {
      set({ error: error.message })
      return { success: false, message: error.message }
    } finally {
      set({ isLoading: false })
    }
  },

  updateInterview: async (id: string, data: Partial<CreateInterviewDto>) => {
    const token = sessionStorage.getItem('token')
    try {
      const response = await fetch(`${API_BASE_URL}/interviews/company/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Failed to update interview')
      return { success: true, message: result.message, interview: result.interview }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  },

  deleteInterview: async (id: string) => {
    const token = sessionStorage.getItem('token')
    try {
      const response = await fetch(`${API_BASE_URL}/interviews/company/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Failed to delete interview')
      return { success: true, message: result.message }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  },

  getInterviewByCompany: async () => {
    set({ isLoading: true, error: null })
    const token = sessionStorage.getItem('token')

    try {
      const response = await fetch(`${API_BASE_URL}/interviews/company/my`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch interviews')
      }

      set({ interviews: result.interview })

      return {
        success: true,
        message: result.message,
        interview: result.interview,
      }
    } catch (error: any) {
      set({ error: error.message })
      return { success: false, message: error.message }
    } finally {
      set({ isLoading: false })
    }
  },

  getCompanyCandidates: async () => {
    const token = sessionStorage.getItem('token')
    try {
      const response = await fetch(`${API_BASE_URL}/interviews/company/candidates`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Failed to fetch candidates')
      return { success: true, message: result.message, candidates: result.candidates }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  },

  getCompanyInterviewCandidates: async (interviewId: string) => {
    const token = sessionStorage.getItem('token')
    try {
      const response = await fetch(`${API_BASE_URL}/interviews/company/interview/${interviewId}/candidates`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Failed to fetch candidates')
      return { success: true, message: result.message, candidates: result.candidates }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  },

  getCompanyAnalytics: async () => {
    const token = sessionStorage.getItem('token')
    try {
      const response = await fetch(`${API_BASE_URL}/interviews/company/analytics`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Failed to fetch analytics')
      return { success: true, analytics: result.analytics }
    } catch (error: any) {
      return { success: false }
    }
  },

  findInterview: async () => {
    set({ isLoading: true, error: null })
    const token = sessionStorage.getItem('token')

    try {
      const response = await fetch(`${API_BASE_URL}/interview-candidate/find`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch interviews')
      }

      set({ interviews: result.interviews })

      return {
        success: true,
        message: result.message,
        interview: result.interviews,
      }
    } catch (error: any) {
      set({ error: error.message })
      return { success: false, message: error.message }
    } finally {
      set({ isLoading: false })
    }
  },

  getInterviewquestions: async (interviewId: string) => {

    set({ isLoading: true });
    try {
      const response = await fetch(`${API_BASE_URL}/interview-candidate/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionStorage.getItem('token')}` },

        body: JSON.stringify({ interviewId })
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to start interview');
      }

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



  submitInterviewAnswers: async (interviewId: string, answers: any[], snapshots: any[] = []) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_BASE_URL}/interview-candidate/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify({
          interviewId,
          answers,
          snapshots
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

  attendInterview: async (interviewId: string) => {
    set({ isLoading: true, error: null })
    const token = sessionStorage.getItem('token')
    try {
      const response = await fetch(`${API_BASE_URL}/interview-candidate/attend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ interviewId }),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.message || 'Failed to attend interview');
      }
      return {
        success: result.success,
        message: result.message,
        interviewCandidateId: result.interviewCandidateId,
      }
    } catch (error: any) {
      set({ error: error.message })
      return {
        success: false,
        message: error.message || 'Something went wrong',
      }
    } finally {
      set({ isLoading: false })
    }
  },
  fetchAttendedInterviews: async () => {
    set({ isLoading: true, error: null })
    const token = sessionStorage.getItem('token')
    try {
      const response = await fetch(`${API_BASE_URL}/interview-candidate/my`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Failed to fetch interviews')
      set({ interviews: result.interviews })
      return { success: true, message: result.message, interview: result.interviews }
    } catch (error: any) {
      set({ error: error.message })
      return { success: false, message: error.message }
    } finally {
      set({ isLoading: false })
    }
  },

  getInterviewFeedback: async (interviewCandidateId: string) => {
    const token = sessionStorage.getItem('token')
    try {
      const response = await fetch(`${API_BASE_URL}/interview-candidate/feedback/${interviewCandidateId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Failed to fetch feedback')
      return { success: true, message: result.message, result: result.result }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  },

  saveSnapshot: async (_interviewCandidateId: string, _type: string, _imageBase64: string) => {
    // Deprecated: now buffered in frontend components and sent during submit
    console.warn('saveSnapshot in store is deprecated - buffer snapshots instead');
  },

  getCompanyShortlist: async () => {
    const token = sessionStorage.getItem('token')
    try {
      const response = await fetch(`${API_BASE_URL}/interviews/company/shortlist/all`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Failed to fetch shortlist')
      return { success: true, message: result.message, candidates: result.candidates }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  },

  getInterviewShortlist: async (interviewId: string) => {
    const token = sessionStorage.getItem('token')
    try {
      const response = await fetch(`${API_BASE_URL}/interview-candidate/company/shortlist/${interviewId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Failed to fetch shortlist')
      return { success: true, message: result.message, candidates: result.candidates }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  },

  getCandidateDetail: async (id: string) => {
    const token = sessionStorage.getItem('token')
    try {
      const response = await fetch(`${API_BASE_URL}/interview-candidate/company/candidate/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Failed to fetch detail')
      return { success: true, result: result.result }
    } catch (error: any) {
      return { success: false, result: null }
    }
  },

  reEvaluateFeedback: async (id: string) => {
    const token = sessionStorage.getItem('token')
    try {
      const response = await fetch(`${API_BASE_URL}/interview-candidate/company/candidate/${id}/re-evaluate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Failed to re-evaluate')
      return { success: true, message: result.message, result: result.result }
    } catch (error: any) {
      return { success: false, message: error.message, result: null }
    }
  },

  markHired: async (id: string, isHired: boolean) => {
    const token = sessionStorage.getItem('token')
    try {
      const response = await fetch(`${API_BASE_URL}/interview-candidate/company/candidate/${id}/hire`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isHired }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Failed to update hire status')
      return { success: true, message: result.message }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  },

  markShortlist: async (id: string, shortlisted: boolean) => {
    const token = sessionStorage.getItem('token')
    try {
      const response = await fetch(`${API_BASE_URL}/interview-candidate/company/candidate/${id}/shortlist`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ shortlisted }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Failed to update shortlist status')
      return { success: true, message: result.message }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  },

  deleteCandidate: async (id: string) => {
    const token = sessionStorage.getItem('token')
    try {
      const response = await fetch(`${API_BASE_URL}/interview-candidate/company/candidate/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Failed to delete candidate')
      return { success: true, message: result.message }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  },
}))
