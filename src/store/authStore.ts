import { create } from 'zustand'
import { AppUser } from '@/types'
import { API_BASE_URL } from '@/config/api'


interface AuthState {
  user: AppUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  login: (email: string, password: string) => Promise<{ success: boolean; message: string; access_token?: string; user?: any; requiresVerification?: boolean; }>
  registerCandidate: (data: { name: string; email: string; password: string; confirmPassword: string }) => Promise<{ success: boolean; message: string, access_token?: string, user?: any }>
  registerCompany: (data: { name: string; email: string; password: string; confirmPassword: string; companyName: string; industry: string; website: string; address: string; size: string; founded: string; }) => Promise<{ success: boolean; message: string, access_token?: string, user?: any }>
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; message: string; user?: any }>
  resendOtp: (email: string) => Promise<{ success: boolean; message: string }>

  logout: () => void
  setUser: (user: AppUser | null) => void
  setError: (error: string | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // ✅ LOGIN UPDATED HERE ACCORDING TO NEW RESPONSE
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      // 🔥 Case 1: Requires email verification
      if (data.requiresVerification) {
        return {
          success: false,
          message: data.message,
          requiresVerification: data.requiresVerification
        }
      }
      else {
        if (response.ok && data.access_token) {
          const normalizedUser = {
            id: data.user._id || data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
            status: data.user.status,
          }
          // Save user in store
          set({
            user: normalizedUser,
            isAuthenticated: true
          })

          return {
            success: true,
            message: data.message,
            access_token: data.access_token,
            user: data.user
          }
        } else {
          throw new Error(data.message || 'Login failed')

        }
      }

    } catch (error: any) {
      set({ error: error.message })
      return { success: false, message: error.message }
    } finally {
      set({ isLoading: false })
    }
  },



  registerCandidate: async (data: { name: string; email: string; password: string, confirmPassword: string }) => {
    set({ isLoading: true, error: null })

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup/candidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const res = await response.json()

      if (response.ok) {
        return {
          success: true,
          message: res.message,
          user: res.user,
          access_token: res.access_token
        }
      } else {
        throw new Error(res.message || 'Registration failed')
      }

    } catch (error: any) {
      set({ error: error.message })
      return { success: false, message: error.message }
    } finally {
      set({ isLoading: false })
    }
  },

  registerCompany: async (data: { name: string; email: string; password: string; confirmPassword: string; companyName: string; industry: string, website: string, address: string, size: string, founded: string }) => {
    set({ isLoading: true, error: null })

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup/company`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const res = await response.json()

      if (response.ok) {
        return {
          success: true,
          message: res.message,
          user: res.user,
          access_token: res.access_token
        }
      } else {
        throw new Error(res.message || 'Registration failed')
      }

    } catch (error: any) {
      set({ error: error.message })
      return { success: false, message: error.message }
    } finally {
      set({ isLoading: false })
    }
  },



  // OPTIONAL: If verify-otp ALSO returns token + user
  verifyOtp: async (email: string, otp: string) => {
    set({ isLoading: true, error: null })

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      })

      const res = await response.json()

      if (response.ok && (res.success || res.isVerified)) {

        // Set user in store
        const userData = res.user || {
          message: res.message,
          id: res.userId,
          email: res.email,
          name: res.name,
          role: res.role,
          isVerified: res.isVerified,
          requiresProfile: res.requiresProfile
        }

        set({
          user: userData,
          isAuthenticated: true
        })

        // ✅ Persist to sessionStorage so user stays logged in after navigation
        if (res.access_token) sessionStorage.setItem('token', res.access_token)
        if (userData) sessionStorage.setItem('user', JSON.stringify(userData))

        return {
          success: true,
          message: res.message,
          user: userData
        }
      } else {
        throw new Error(res.message || 'OTP verification failed')
      }

    } catch (error: any) {
      set({ error: error.message })
      return { success: false, message: error.message }
    } finally {
      set({ isLoading: false })
    }
  },


  resendOtp: async (email) => {
    set({ isLoading: true, error: null })

    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        return { success: true, message: data.message }
      } else {
        throw new Error(data.message)
      }

    } catch (error: any) {
      set({ error: error.message })
      return { success: false, message: error.message }

    } finally {
      set({ isLoading: false })
    }
  },



  logout: () => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    set({ user: null, isAuthenticated: false })
  },

  setUser: (user) => {
    set({ user, isAuthenticated: !!user })
  },

  setError: (error) => set({ error }),



}))



