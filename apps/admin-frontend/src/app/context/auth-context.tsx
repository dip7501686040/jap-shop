"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"

// User interface
interface User {
  id: string
  name: string
  email: string
  role: string
}

// Auth context interface
interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  forgotPassword: (email: string) => Promise<boolean>
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
  const router = useRouter()

  // Check if user is logged in on component mount
  useEffect(() => {
    const checkAuth = async () => {
      // Check local storage for user
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
        } catch (error) {
          console.error("Failed to parse user data", error)
          localStorage.removeItem("user")
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      // Mock authentication - Replace with actual auth API call later
      if (email === "admin@example.com" && password === "password") {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 800))

        // Create mock user
        const user: User = {
          id: "user-1",
          name: "Admin User",
          email: email,
          role: "admin"
        }

        // Save user to state and localStorage
        setUser(user)
        localStorage.setItem("user", JSON.stringify(user))
        return true
      }
      return false
    } catch (error) {
      console.error("Login failed:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Signup function
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      // Mock signup - Replace with actual signup API call later
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800))
      return true
    } catch (error) {
      console.error("Signup failed:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    router.push("/auth/login")
  }

  // Forgot password function
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const forgotPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      // Mock password reset - Replace with actual API call later
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800))
      return true
    } catch (error) {
      console.error("Password reset failed:", error)
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
    signup,
    logout,
    forgotPassword
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
