import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from "axios"
import { tokenStorage } from "./cookies"

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json"
  }
})

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from cookies
    const token = typeof window !== "undefined" ? tokenStorage.getAccessToken() : null

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() }

    // Log request in development
    if (process.env.NODE_ENV === "development") {
      console.log("🚀 Request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        headers: config.headers
      })
    }

    return config
  },
  (error: AxiosError) => {
    console.error("❌ Request Error:", error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Calculate request duration
    const duration = response.config.metadata?.startTime ? new Date().getTime() - response.config.metadata.startTime.getTime() : 0

    // Log response in development
    if (process.env.NODE_ENV === "development") {
      console.log("✅ Response:", {
        status: response.status,
        url: response.config.url,
        duration: `${duration}ms`,
        data: response.data
      })
    }

    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Log error in development
    if (process.env.NODE_ENV === "development") {
      console.error("❌ Response Error:", {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data
      })
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh token
        const refreshToken = typeof window !== "undefined" ? tokenStorage.getRefreshToken() : null

        if (refreshToken) {
          const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
            refreshToken
          })

          const { accessToken } = response.data.data || response.data

          // Update tokens in cookies
          if (typeof window !== "undefined") {
            tokenStorage.setAccessToken(accessToken)
          }

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        if (typeof window !== "undefined") {
          tokenStorage.clearTokens()
          window.location.href = "/auth/login"
        }
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      if (typeof window !== "undefined") {
        // Redirect to unauthorized page or show error message
        console.error("Access denied. Insufficient permissions.")
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error("Network Error: Please check your internet connection")
    }

    return Promise.reject(error)
  }
)

// Extend AxiosRequestConfig to include metadata
declare module "axios" {
  interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: Date
    }
  }
}

// API helper functions
export const apiClient = {
  // GET request
  get: <T = any>(url: string, config?: any): Promise<AxiosResponse<T>> => {
    return api.get(url, config)
  },

  // POST request
  post: <T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> => {
    return api.post(url, data, config)
  },

  // PUT request
  put: <T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> => {
    return api.put(url, data, config)
  },

  // PATCH request
  patch: <T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> => {
    return api.patch(url, data, config)
  },

  // DELETE request
  delete: <T = any>(url: string, config?: any): Promise<AxiosResponse<T>> => {
    return api.delete(url, config)
  },

  // Upload file
  upload: <T = any>(url: string, formData: FormData, onUploadProgress?: (progressEvent: any) => void): Promise<AxiosResponse<T>> => {
    return api.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      },
      onUploadProgress
    })
  }
}

// Export the configured axios instance
export default api
