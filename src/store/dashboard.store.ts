import { create } from 'zustand'
import { Skill } from '@/types'
import { API_BASE_URL } from '@/config/api'

export interface DashboardStats {
    totalInterviews: number
    completedInterviews: number
    averageScore: number
    improvement: number
    skillsCount: number
}

export interface PerformanceTrend {
    month: string
    score: number
    interviewCount?: number
}

export interface SkillProficiency {
    name: string
    level: number
    yearsOfExperience?: number
}

export interface InterviewRecord {
    _id: string
    interview: {
        _id: string
        jobTitle: string
        company?: {
            _id: string
            companyName: string
        }
        requiredSkills: string[]
        location: string
        salary: string
        description: string
    }
    candidate: string
    attended: boolean
    isHired?: boolean
    snapshots?: Array<{
        type: 'START' | 'MID' | 'END'
        image: string
        capturedAt: string
    }>
    createdAt: string
    score?: number
}

export interface MockInterviewHistory {
    _id: string
    id?: string
    difficulty: 'Easy' | 'Medium' | 'Hard'
    totalScore: number
    skillLevel: string
    status: string
    startedAt: string
    submittedAt?: string
}

export interface MockFeedback {
    totalAttempts: number
    averageScore: number
    overallSkillLevel: string
    trend: string
    evaluation: {
        conceptAccuracy: number
        depthOfAnswer: number
        relevance: number
        timeEfficiency: number
    }
    feedback: {
        strengths: string[]
        weaknesses: string[]
        learningPath: string[]
    }
}

interface DashboardState {
    isLoading: boolean
    error: string | null

    fetchUserProfile: () => Promise<{ success: boolean; message: string; user?: any }>
    fetchAttendedInterviews: () => Promise<{ success: boolean; message: string; interviews?: InterviewRecord[] }>
    fetchMockInterviewHistory: () => Promise<{ success: boolean; message: string; history?: MockInterviewHistory[] }>
    fetchOverallMockFeedback: () => Promise<{ success: boolean; message: string; result?: MockFeedback }>
    fetchMockFeedbackByAttemptId: (attemptId: string) => Promise<{ success: boolean; message: string; result?: any }>

    calculatePerformanceTrend: (history: MockInterviewHistory[], attendedInterviews: InterviewRecord[]) => PerformanceTrend[]
    calculateDashboardStats: (skills: Skill[], attendedInterviews: InterviewRecord[], mockHistory: MockInterviewHistory[], overallFeedback?: MockFeedback) => DashboardStats

    hideMockInterview: (attemptId: string) => Promise<{ success: boolean; message: string }>
    hideCompanyInterview: (interviewId: string) => Promise<{ success: boolean; message: string }>
}

export const useDashboardStore = create<DashboardState>(() => ({
    isLoading: false,
    error: null,

    fetchUserProfile: async () => {
        const token = sessionStorage.getItem('token')
        const userString = sessionStorage.getItem('user')

        if (!userString || !token) {
            return { success: false, message: 'No user data found' }
        }

        const user = JSON.parse(userString)

        try {
            const response = await fetch(`${API_BASE_URL}/user/profile/${user.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            })
            const result = await response.json()
            if (response.ok) {
                return { success: true, message: result.message || 'Profile Fetched successfully', user: result.user }
            } else {
                return { success: false, message: result.message || 'Failed to fetch profile' }
            }
        } catch (error: any) {
            return { success: false, message: error.message || 'An error occurred while fetching profile' }
        }
    },

    fetchAttendedInterviews: async () => {
        const token = sessionStorage.getItem('token')
        try {
            const response = await fetch(`${API_BASE_URL}/interview-candidate/my`, {
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
            return { success: true, message: result.message, interviews: result.interviews || [] }
        } catch (error: any) {
            return { success: false, message: error.message, interviews: [] }
        }
    },

    fetchMockInterviewHistory: async () => {
        const token = sessionStorage.getItem('token')
        try {
            const response = await fetch(`${API_BASE_URL}/mock-interview/history`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            })
            const result = await response.json()
            if (!response.ok) {
                throw new Error(result.message || 'Failed to fetch mock history')
            }
            const history = Array.isArray(result) ? result : []
            return { success: true, message: 'History fetched successfully', history: history }
        } catch (error: any) {
            return { success: false, message: error.message, history: [] }
        }
    },

    fetchOverallMockFeedback: async () => {
        const token = sessionStorage.getItem('token')
        try {
            const response = await fetch(`${API_BASE_URL}/mock-interview/overall-feedback`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            })
            const result = await response.json()
            if (!response.ok) {
                throw new Error(result.message || 'Failed to fetch overall feedback')
            }
            return { success: true, message: result.message, result: result.result }
        } catch (error: any) {
            return { success: false, message: error.message }
        }
    },

    fetchMockFeedbackByAttemptId: async (attemptId: string) => {
        const token = sessionStorage.getItem('token')
        try {
            const response = await fetch(`${API_BASE_URL}/mock-interview/feedback/${attemptId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            })
            const result = await response.json()
            if (!response.ok) {
                throw new Error(result.message || 'Failed to fetch feedback')
            }
            return { success: true, message: result.message || 'Feedback fetched', result: result.result }
        } catch (error: any) {
            return { success: false, message: error.message }
        }
    },

    hideMockInterview: async (attemptId: string) => {
        const token = sessionStorage.getItem('token')
        try {
            const response = await fetch(`${API_BASE_URL}/mock-interview/${attemptId}/hide`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            })
            const result = await response.json()
            if (!response.ok) {
                throw new Error(result.message || 'Failed to hide mock interview')
            }
            return { success: true, message: result.message || 'Interview hidden successfully' }
        } catch (error: any) {
            return { success: false, message: error.message }
        }
    },

    hideCompanyInterview: async (interviewId: string) => {
        const token = sessionStorage.getItem('token')
        try {
            const response = await fetch(`${API_BASE_URL}/interview-candidate/${interviewId}/hide`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            })
            const result = await response.json()
            if (!response.ok) {
                throw new Error(result.message || 'Failed to hide company interview')
            }
            return { success: true, message: result.message || 'Interview hidden successfully' }
        } catch (error: any) {
            return { success: false, message: error.message }
        }
    },

    calculatePerformanceTrend: (history: MockInterviewHistory[], attendedInterviews: InterviewRecord[]) => {
        const monthlyData = new Map<string, { totalScore: number; count: number }>()

        if (history && history.length > 0) {
            const sortedMockHistory = [...history].sort(
                (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
            )
            sortedMockHistory.forEach((item) => {
                if (item.totalScore && item.totalScore > 0) {
                    const date = new Date(item.startedAt)
                    const monthKey = date.toLocaleString('default', { month: 'short' })
                    const existing = monthlyData.get(monthKey) || { totalScore: 0, count: 0 }
                    existing.totalScore += item.totalScore
                    existing.count += 1
                    monthlyData.set(monthKey, existing)
                }
            })
        }

        const scoredAttendedInterviews = attendedInterviews.filter(
            (interview) =>
                interview.attended &&
                (interview.score !== undefined || (interview.snapshots && interview.snapshots.length > 0))
        )

        scoredAttendedInterviews.forEach((interview) => {
            const score = interview.score || 75
            const date = new Date(interview.createdAt)
            const monthKey = date.toLocaleString('default', { month: 'short' })
            const existing = monthlyData.get(monthKey) || { totalScore: 0, count: 0 }
            existing.totalScore += score
            existing.count += 1
            monthlyData.set(monthKey, existing)
        })

        return Array.from(monthlyData.entries()).map(([month, data]) => ({
            month,
            score: Math.round(data.totalScore / data.count),
            interviewCount: data.count,
        }))
    },

    calculateDashboardStats: (skills: Skill[] = [], attendedInterviews: InterviewRecord[] = [], mockHistory: MockInterviewHistory[] = [], overallFeedback?: MockFeedback) => {
        const totalInterviews = attendedInterviews.length + (mockHistory.length || 0)
        const completedInterviews = attendedInterviews.filter((i) => i.attended).length +
            mockHistory.filter((m) => m.status === 'SUBMITTED').length

        let totalScore = 0
        let scoreCount = 0

        mockHistory.forEach((m) => {
            if (m.totalScore) {
                totalScore += m.totalScore
                scoreCount += 1
            }
        })

        if (overallFeedback) {
            totalScore += overallFeedback.averageScore * overallFeedback.totalAttempts
            scoreCount += overallFeedback.totalAttempts
        }

        const averageScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0

        let improvement = 0

        if (overallFeedback && overallFeedback.trend) {
            improvement = overallFeedback.trend === 'Improving' ? 15 : 0
        } else {
            const scoredMocks = mockHistory
                .filter((m) => m.status === 'SUBMITTED' && m.totalScore)
                .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime())

            if (scoredMocks.length >= 2) {
                const mid = Math.ceil(scoredMocks.length / 2)
                const firstHalf = scoredMocks.slice(0, mid)
                const secondHalf = scoredMocks.slice(mid)

                const firstAvg = firstHalf.reduce((sum, m) => sum + (m.totalScore || 0), 0) / firstHalf.length
                const secondAvg = secondHalf.reduce((sum, m) => sum + (m.totalScore || 0), 0) / secondHalf.length

                if (firstAvg > 0) {
                    improvement = Math.round(((secondAvg - firstAvg) / firstAvg) * 100)
                } else if (secondAvg > 0) {
                    improvement = 100
                }

                improvement = Math.max(-50, Math.min(100, improvement))
            }
        }

        return {
            totalInterviews,
            completedInterviews,
            averageScore: averageScore || overallFeedback?.averageScore || 0,
            improvement: improvement,
            skillsCount: skills.length,
        }
    }
}))
