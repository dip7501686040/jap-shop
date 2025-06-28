"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { tokenStorage } from "@/lib/cookies"
import { AuthService, type User, type LoginRequest, type SignupRequest, type VerifyOtpRequest } from "@/lib/api-services"
import { handleApiError } from "@/hooks/useApi"

// Auth context interface
interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean | "otp_required">
  verifyOtp: (email: string, otp: string) => Promise<boolean>
  resendOtp: (email: string) => Promise<boolean>
  signup: (fullName: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  forgotPassword: (email: string) => Promise<boolean>
  error: string | null
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider props
interface AuthProviderProps {
  children: ReactNode
}

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Check if user is logged in on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = tokenStorage.getAccessToken()
        if (token) {
          // Verify token and get user data
          const response = await AuthService.getCurrentUser()
          if (response.success) {
            setUser(response.data)
          } else {
            // Token is invalid, clear cookies
            tokenStorage.clearTokens()
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        tokenStorage.clearTokens()
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Login function
  const login = async (email: string, password: string): Promise<boolean | "otp_required"> => {
    setIsLoading(true)
    setError(null)
    try {
      const loginData: LoginRequest = { email, password }
      const response = await AuthService.login(loginData)

      // Check if this is an OTP response (for superAdmin)
      if (response.message === "OTP sent to your email" || (response.data && typeof response.data === "object" && "message" in response.data && response.data.message === "OTP sent to your email")) {
        return "otp_required"
      }

      // Normal login response with tokens
      const { user, accessToken, refreshToken } = response.data

      // Save tokens in cookies
      tokenStorage.setAccessToken(accessToken)
      tokenStorage.setRefreshToken(refreshToken)
      setUser(user)

      return true
    } catch (err) {
      const apiError = handleApiError(err)
      setError(apiError.message)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Verify OTP function
  const verifyOtp = async (email: string, otp: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const verifyData: VerifyOtpRequest = { email, otp }
      const response = await AuthService.verifyOtp(verifyData)

      if (response.success) {
        const { user, accessToken, refreshToken } = response.data

        // Save tokens in cookies
        tokenStorage.setAccessToken(accessToken)
        tokenStorage.setRefreshToken(refreshToken)
        setUser(user)

        return true
      } else {
        setError(response.message || "OTP verification failed")
        return false
      }
    } catch (err) {
      const apiError = handleApiError(err)
      setError(apiError.message)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Resend OTP function
  const resendOtp = async (email: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await AuthService.resendOtp(email)

      if (response.success) {
        return true
      } else {
        setError(response.message || "Failed to resend OTP")
        return false
      }
    } catch (err) {
      const apiError = handleApiError(err)
      setError(apiError.message)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Signup function
  const signup = async (fullName: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const signupData: SignupRequest = { name: fullName, email, password }
      const response = await AuthService.signup(signupData)

      if (response.success) {
        return true
      } else {
        setError(response.message || "Signup failed")
        return false
      }
    } catch (err) {
      const apiError = handleApiError(err)
      setError(apiError.message)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    setIsLoading(true)

    try {
      await AuthService.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Clear local state and cookies regardless of API call result
      setUser(null)
      setError(null)
      tokenStorage.clearTokens()
      setIsLoading(false)
      router.push("/auth/login")
    }
  }

  // Forgot password function
  const forgotPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await AuthService.forgotPassword(email)

      if (response.success) {
        return true
      } else {
        setError(response.message || "Password reset failed")
        return false
      }
    } catch (err) {
      const apiError = handleApiError(err)
      setError(apiError.message)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Context value
  const value = {
    user,
    isLoading,
    login,
    verifyOtp,
    resendOtp,
    signup,
    logout,
    forgotPassword,
    error
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
