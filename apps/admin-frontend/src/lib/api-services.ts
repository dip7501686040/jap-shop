import { apiClient } from "./api"

// Types for API responses
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface Role {
  id: string
  name: string
  description?: string
}

export interface User {
  id: string
  email: string
  name: string
  roleId?: string
  role?: Role
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface SignupRequest {
  name: string
  email: string
  password: string
}

export interface SignupResponse {
  user: User
}

export interface VerifyOtpRequest {
  email: string
  otp: string
}

export interface OtpResponse {
  message: string
}

export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  entries?: Entry[]
  createdAt: string
  updatedAt: string
}

export interface Entry {
  id: string
  type: "GAVE" | "GOT"
  amount: number
  customerId: string
  customer?: Customer
  createdAt: string
  updatedAt: string
}

export interface CreateCustomerRequest {
  name: string
  email?: string
  phone?: string
  address?: string
}

export interface UpdateCustomerRequest {
  name?: string
  email?: string
  phone?: string
  address?: string
}

export interface CreateEntryRequest {
  type: "GAVE" | "GOT"
  amount: number
  customerId: string
}

export interface UpdateEntryRequest {
  type?: "GAVE" | "GOT"
  amount?: number
  customerId?: string
}

// Auth API service
export class AuthService {
  private static readonly BASE_PATH = "/auth"

  static async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(`${this.BASE_PATH}/login`, credentials)
    return response.data
  }

  static async signup(userData: SignupRequest): Promise<ApiResponse<SignupResponse>> {
    const response = await apiClient.post<ApiResponse<SignupResponse>>(`${this.BASE_PATH}/signup`, userData)
    return response.data
  }

  static async logout(): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>(`${this.BASE_PATH}/logout`)
    return response.data
  }

  static async refreshToken(refreshToken: string): Promise<ApiResponse<{ accessToken: string }>> {
    const response = await apiClient.post<ApiResponse<{ accessToken: string }>>(`${this.BASE_PATH}/refresh`, { refreshToken })
    return response.data
  }

  static async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>(`${this.BASE_PATH}/me`)
    return response.data
  }

  static async forgotPassword(email: string): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>(`${this.BASE_PATH}/forgot-password`, { email })
    return response.data
  }

  static async resetPassword(token: string, newPassword: string): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>(`${this.BASE_PATH}/reset-password`, { token, newPassword })
    return response.data
  }

  static async verifyOtp(verifyData: VerifyOtpRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(`${this.BASE_PATH}/verify-otp`, verifyData)
    return response.data
  }

  static async resendOtp(email: string): Promise<ApiResponse<OtpResponse>> {
    // For resending OTP, we can call the login endpoint again with the same credentials
    // This will trigger OTP generation again for superAdmin users
    const response = await apiClient.post<ApiResponse<OtpResponse>>(`${this.BASE_PATH}/resend-otp`, { email })
    return response.data
  }
}

// User API service
export class UserService {
  private static readonly BASE_PATH = "/users"

  static async getUsers(page = 1, limit = 10): Promise<ApiResponse<{ users: User[]; total: number }>> {
    const response = await apiClient.get<ApiResponse<{ users: User[]; total: number }>>(`${this.BASE_PATH}?page=${page}&limit=${limit}`)
    return response.data
  }

  static async getUserById(id: string): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>(`${this.BASE_PATH}/${id}`)
    return response.data
  }

  static async updateUser(id: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    const response = await apiClient.put<ApiResponse<User>>(`${this.BASE_PATH}/${id}`, userData)
    return response.data
  }

  static async deleteUser(id: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`${this.BASE_PATH}/${id}`)
    return response.data
  }
}

// Dashboard API service
export class DashboardService {
  private static readonly BASE_PATH = "/dashboard"

  static async getStats(): Promise<ApiResponse<Record<string, unknown>>> {
    const response = await apiClient.get<ApiResponse<Record<string, unknown>>>(`${this.BASE_PATH}/stats`)
    return response.data
  }

  static async getRecentActivity(): Promise<ApiResponse<Record<string, unknown>[]>> {
    const response = await apiClient.get<ApiResponse<Record<string, unknown>[]>>(`${this.BASE_PATH}/recent-activity`)
    return response.data
  }
}

// Customer API service
export class CustomerService {
  private static readonly BASE_PATH = "/customers"

  static async getCustomers(): Promise<ApiResponse<Customer[]>> {
    const response = await apiClient.get<ApiResponse<Customer[]>>(`${this.BASE_PATH}`)
    return response.data
  }

  static async getCustomerById(id: string): Promise<ApiResponse<Customer>> {
    const response = await apiClient.get<ApiResponse<Customer>>(`${this.BASE_PATH}/${id}`)
    return response.data
  }

  static async createCustomer(customerData: CreateCustomerRequest): Promise<ApiResponse<Customer>> {
    const response = await apiClient.post<ApiResponse<Customer>>(`${this.BASE_PATH}`, customerData)
    return response.data
  }

  static async updateCustomer(id: string, customerData: UpdateCustomerRequest): Promise<ApiResponse<Customer>> {
    const response = await apiClient.patch<ApiResponse<Customer>>(`${this.BASE_PATH}/${id}`, customerData)
    return response.data
  }

  static async deleteCustomer(id: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`${this.BASE_PATH}/${id}`)
    return response.data
  }

  static async getCustomerGOTBalance(id: string): Promise<ApiResponse<number>> {
    const response = await apiClient.get<ApiResponse<number>>(`${this.BASE_PATH}/${id}/balanceGot`)
    return response.data
  }

  static async getCustomerGAVEBalance(id: string): Promise<ApiResponse<number>> {
    const response = await apiClient.get<ApiResponse<number>>(`${this.BASE_PATH}/${id}/balanceGave`)
    return response.data
  }

  static async getSummary(): Promise<ApiResponse<{ totalDebits: number; totalCredits: number }>> {
    const response = await apiClient.get<ApiResponse<{ totalDebits: number; totalCredits: number }>>(`${this.BASE_PATH}/summary`)
    return response.data
  }
}

// Entry API service
export class EntryService {
  private static readonly BASE_PATH = "/entries"

  static async getEntries(customerId?: string): Promise<ApiResponse<Entry[]>> {
    const params = customerId ? `?customerId=${customerId}` : ""
    const response = await apiClient.get<ApiResponse<Entry[]>>(`${this.BASE_PATH}${params}`)
    return response.data
  }

  static async getEntryById(id: string): Promise<ApiResponse<Entry>> {
    const response = await apiClient.get<ApiResponse<Entry>>(`${this.BASE_PATH}/${id}`)
    return response.data
  }

  static async createEntry(entryData: CreateEntryRequest): Promise<ApiResponse<Entry>> {
    const response = await apiClient.post<ApiResponse<Entry>>(`${this.BASE_PATH}`, entryData)
    return response.data
  }

  static async updateEntry(id: string, entryData: UpdateEntryRequest): Promise<ApiResponse<Entry>> {
    const response = await apiClient.patch<ApiResponse<Entry>>(`${this.BASE_PATH}/${id}`, entryData)
    return response.data
  }

  static async deleteEntry(id: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`${this.BASE_PATH}/${id}`)
    return response.data
  }

  static async getEntriesByCustomer(customerId: string): Promise<ApiResponse<Entry[]>> {
    const response = await apiClient.get<ApiResponse<Entry[]>>(`${this.BASE_PATH}/customer/${customerId}`)
    return response.data
  }

  static async getCustomerGOTBalance(customerId: string): Promise<ApiResponse<number>> {
    const response = await apiClient.get<ApiResponse<number>>(`${this.BASE_PATH}/customer/${customerId}/got-balance`)
    return response.data
  }

  static async getCustomerGAVEBalance(customerId: string): Promise<ApiResponse<number>> {
    const response = await apiClient.get<ApiResponse<number>>(`${this.BASE_PATH}/customer/${customerId}/gave-balance`)
    return response.data
  }
}

// Generic API service for custom endpoints
export class ApiService {
  static async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await apiClient.get<ApiResponse<T>>(endpoint)
    return response.data
  }

  static async post<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    const response = await apiClient.post<ApiResponse<T>>(endpoint, data)
    return response.data
  }

  static async put<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    const response = await apiClient.put<ApiResponse<T>>(endpoint, data)
    return response.data
  }

  static async patch<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    const response = await apiClient.patch<ApiResponse<T>>(endpoint, data)
    return response.data
  }

  static async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await apiClient.delete<ApiResponse<T>>(endpoint)
    return response.data
  }
}

// Password Reset API functions
export const forgotPassword = async (email: string): Promise<ApiResponse<null>> => {
  const response = await apiClient.post<ApiResponse<null>>("/auth/forgot-password", { email })
  return response.data
}

export const resetPassword = async (token: string, newPassword: string): Promise<ApiResponse<null>> => {
  const response = await apiClient.post<ApiResponse<null>>("/auth/reset-password", {
    token,
    newPassword
  })
  return response.data
}
