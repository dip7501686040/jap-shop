"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import { useRouter } from "next/navigation"
import { tokenStorage } from "@/lib/cookies"
import { AuthService, type User, type LoginRequest, type SignupRequest, type VerifyOtpRequest, getUserMenus, Menu } from "@/lib/api-services"
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
  refreshUser: () => Promise<void>
  error: string | null
  // Password visibility state
  passwordVisibility: Record<string, boolean>
  togglePasswordVisibility: (fieldId: string) => void
  setPasswordVisibility: (fieldId: string, visible: boolean) => void
  // Menu state
  menus: Menu[]
  menuLoading: boolean
  menuError: string | null
  refetchMenus: () => Promise<void>
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
  const [passwordVisibility, setPasswordVisibilityState] = useState<Record<string, boolean>>({})
  const [menus, setMenus] = useState<Menu[]>([])
  const [menuLoading, setMenuLoading] = useState(true)
  const [menuError, setMenuError] = useState<string | null>(null)
  const router = useRouter()

  // Common function to set user and menus together
  const setUserAndMenus = useCallback(async (user: User | null) => {
    setUser(user)
    if (user) {
      // Fetch menus when user is set
      try {
        setMenuLoading(true)
        setMenuError(null)
        const response = await getUserMenus()
        if (response.success) {
          setMenus(response.data)
        } else {
          setMenuError("Failed to fetch menus")
          setMenus([])
        }
      } catch (err) {
        setMenuError("Failed to fetch menus")
        setMenus([])
        console.error("Error fetching user menus:", err)
      } finally {
        setMenuLoading(false)
      }
    } else {
      // Clear menus when user is null
      setMenus([])
      setMenuError(null)
      setMenuLoading(false)
    }
  }, [])

  // Check if user is logged in on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = tokenStorage.getAccessToken()
        if (token) {
          // Verify token and get user data
          const response = await AuthService.getCurrentUser()
          if (response.success && response.data) {
            setUserAndMenus(response.data)
            // If on login or auth page, redirect to dashboard
            if (window.location.pathname.startsWith("/auth")) {
              router.push("/dashboard")
            }
          } else {
            // Token is invalid, clear cookies
            console.log("Token validation failed:", response.message)
            tokenStorage.clearTokens()
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        // Check if this is a 401 (unauthorized) error
        if (error && typeof error === "object" && "status" in error && error.status === 401) {
          // Only clear tokens if it's specifically an authentication error
          console.log("Authentication failed, clearing tokens")
          tokenStorage.clearTokens()
        } else {
          // For other errors (like 500), keep the user logged in
          // but log the error for debugging
          console.log("Temporary API error, keeping user logged in")
          // Try to get user from stored token data if available
          const token = tokenStorage.getAccessToken()
          if (token) {
            try {
              // Decode token to get basic user info (without API call)
              const payload = JSON.parse(atob(token.split(".")[1]))
              if (payload.exp * 1000 > Date.now()) {
                // Token is not expired, create minimal user object
                const userData = {
                  id: payload.id,
                  email: payload.email,
                  name: payload.name,
                  role: { id: payload.role_id, name: payload.role }
                } as User
                setUserAndMenus(userData)
              } else {
                // Token is expired
                tokenStorage.clearTokens()
              }
            } catch (decodeError) {
              console.error("Failed to decode token:", decodeError)
              tokenStorage.clearTokens()
            }
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  // Login function
  const login = async (email: string, password: string): Promise<boolean | "otp_required"> => {
    setIsLoading(true)
    setError(null)
    try {
      const loginData: LoginRequest = { email, password }
      const response = await AuthService.login(loginData)

      // Check if this is an OTP response (for SuperAdmin)
      if (response.message === "OTP sent to your email" || (response.data && typeof response.data === "object" && "message" in response.data && response.data.message === "OTP sent to your email")) {
        return "otp_required"
      }

      // Normal login response with tokens
      const { user, accessToken, refreshToken } = response.data

      // Save tokens in cookies
      tokenStorage.setAccessToken(accessToken)
      tokenStorage.setRefreshToken(refreshToken)
      setUserAndMenus(user)

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
        setUserAndMenus(user)

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
      setUserAndMenus(null)
      setError(null)
      tokenStorage.clearTokens()
      setIsLoading(false)
      router.push("/auth/login")
    }
  }

  // Refresh user function
  const refreshUser = async () => {
    try {
      const token = tokenStorage.getAccessToken()
      if (token) {
        const response = await AuthService.getCurrentUser()
        if (response.success && response.data) {
          setUserAndMenus(response.data)
        }
      }
    } catch (error) {
      console.error("Error refreshing user data:", error)
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

  // Password visibility functions
  const togglePasswordVisibility = (fieldId: string) => {
    setPasswordVisibilityState((prev) => ({
      ...prev,
      [fieldId]: !prev[fieldId]
    }))
  }

  const setPasswordVisibility = (fieldId: string, visible: boolean) => {
    setPasswordVisibilityState((prev) => ({
      ...prev,
      [fieldId]: visible
    }))
  }

  // Menu functions
  const fetchMenus = useCallback(async () => {
    try {
      setMenuLoading(true)
      setMenuError(null)
      const response = await getUserMenus()
      if (response.success) {
        setMenus(response.data)
      } else {
        setMenuError("Failed to fetch menus")
      }
    } catch (err) {
      setMenuError("Failed to fetch menus")
      console.error("Error fetching user menus:", err)
    } finally {
      setMenuLoading(false)
    }
  }, [])

  const refetchMenus = useCallback(async () => {
    await fetchMenus()
  }, [fetchMenus])

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
    refreshUser,
    error,
    passwordVisibility,
    togglePasswordVisibility,
    setPasswordVisibility,
    menus,
    menuLoading,
    menuError,
    refetchMenus
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
