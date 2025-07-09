import { apiClient } from "./api"

// Types for API responses
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface Role {
  id: string
  name: string
  description?: string
}

export interface Logbook {
  id: string
  name: string
  description?: string
  userLogbooks?: UserLogbook[]
  logbookCustomers?: LogbookCustomer[]
  _count?: {
    userLogbooks: number
    logbookCustomers: number
  }
  createdAt: string
  updatedAt: string
}

export interface UserLogbook {
  id: string
  userId: string
  logbookId: string
  canAdd: boolean
  canRead: boolean
  canUpdate: boolean
  canDelete: boolean
  user: {
    id: string
    name: string
    email: string
  }
  logbook?: Logbook
  createdAt: string
  updatedAt: string
}

export interface LogbookCustomer {
  id: string
  logbookId: string
  customerId: string
  logbook?: Logbook
  customer: Customer
  createdAt: string
  updatedAt: string
}

export interface CreateLogbookRequest {
  name: string
  description?: string
}

export interface UpdateLogbookRequest {
  name?: string
  description?: string
}

export interface LogbookPermissionRequest {
  userId: string
  canAdd: boolean
  canRead: boolean
  canUpdate: boolean
  canDelete: boolean
}

export interface AddCustomerToLogbookRequest {
  customerId: string
}

export interface User {
  id: string
  email: string
  name: string
  roleId?: string
  role?: Role
  createdAt: string
  updatedAt: string
  userMenus?: UserMenus
  rolePermissions?: RolePermissions
  menuPermissions?: MenuPermissions
}

export interface UserMenu {
  id: string
  name: string
  href: string
  icon: string
  order: number
  isActive: boolean
  canAdd: boolean
  canRead: boolean
  canUpdate: boolean
  canDelete: boolean
}

export type UserMenus = UserMenu[]

export interface RolePermissions {
  [key: string]: boolean
}

export interface MenuPermissions {
  [key: string]: {
    canAdd: boolean
    canRead: boolean
    canUpdate: boolean
    canDelete: boolean
  }
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

export interface UpdateUserRequest {
  name?: string
  email?: string
  roleId?: string
}

export interface CreateRoleRequest {
  name: string
  description?: string
}

export interface UpdateRoleRequest {
  name?: string
  description?: string
}

export interface Menu {
  id: string
  name: string
  href: string
  icon?: string
  order: number
  isActive: boolean
  parentId?: string
  parent?: Menu
  children?: Menu[]
  roleMenus?: Array<{
    id: string
    roleId: string
    menuId: string
    role: Role
  }>
  createdAt: string
  updatedAt: string
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
    // This will trigger OTP generation again for SuperAdmin users
    const response = await apiClient.post<ApiResponse<OtpResponse>>(`${this.BASE_PATH}/resend-otp`, { email })
    return response.data
  }
}

// User API service
export class UserService {
  private static readonly BASE_PATH = "/user"

  static async getUsers(): Promise<ApiResponse<User[]>> {
    const response = await apiClient.get<ApiResponse<User[]>>(`${this.BASE_PATH}`)
    return response.data
  }

  static async getUserById(id: string): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>(`${this.BASE_PATH}/${id}`)
    return response.data
  }

  static async updateUser(id: string, userData: UpdateUserRequest): Promise<ApiResponse<User>> {
    const response = await apiClient.patch<ApiResponse<User>>(`${this.BASE_PATH}/${id}`, userData)
    return response.data
  }

  static async deleteUser(id: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`${this.BASE_PATH}/${id}`)
    return response.data
  }
}

// Role API service
export class RoleService {
  private static readonly BASE_PATH = "/roles"

  static async getRoles(): Promise<ApiResponse<Role[]>> {
    const response = await apiClient.get<ApiResponse<Role[]>>(`${this.BASE_PATH}`)
    return response.data
  }

  static async getRoleById(id: string): Promise<ApiResponse<Role>> {
    const response = await apiClient.get<ApiResponse<Role>>(`${this.BASE_PATH}/${id}`)
    return response.data
  }

  static async createRole(roleData: CreateRoleRequest): Promise<ApiResponse<Role>> {
    const response = await apiClient.post<ApiResponse<Role>>(`${this.BASE_PATH}`, roleData)
    return response.data
  }

  static async updateRole(id: string, roleData: UpdateRoleRequest): Promise<ApiResponse<Role>> {
    const response = await apiClient.patch<ApiResponse<Role>>(`${this.BASE_PATH}/${id}`, roleData)
    return response.data
  }

  static async deleteRole(id: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`${this.BASE_PATH}/${id}`)
    return response.data
  }
}

// Alias for convenience
export const getAllRoles = RoleService.getRoles

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

  // Logbook-aware customer methods
  static async getCustomersByLogbook(logbookId: string): Promise<ApiResponse<Customer[]>> {
    const response = await apiClient.get<ApiResponse<Customer[]>>(`/logbooks/${logbookId}/customers`)
    return response.data
  }

  static async getSummaryByLogbook(logbookId: string): Promise<ApiResponse<{ totalDebits: number; totalCredits: number }>> {
    const response = await apiClient.get<ApiResponse<{ totalDebits: number; totalCredits: number }>>(`/logbooks/${logbookId}/customers/summary`)
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

// Menu API functions
export const getUserMenus = async (): Promise<ApiResponse<Menu[]>> => {
  const response = await apiClient.get<ApiResponse<Menu[]>>("/auth/menus")
  return response.data
}

export const getAllMenus = async (): Promise<ApiResponse<Menu[]>> => {
  const response = await apiClient.get<ApiResponse<Menu[]>>("/menus")
  return response.data
}

export const getMenuById = async (id: string): Promise<ApiResponse<Menu>> => {
  const response = await apiClient.get<ApiResponse<Menu>>(`/menus/${id}`)
  return response.data
}

export const createMenu = async (menuData: Partial<Menu>): Promise<ApiResponse<Menu>> => {
  const response = await apiClient.post<ApiResponse<Menu>>("/menus", menuData)
  return response.data
}

export const updateMenu = async (id: string, menuData: Partial<Menu>): Promise<ApiResponse<Menu>> => {
  const response = await apiClient.patch<ApiResponse<Menu>>(`/menus/${id}`, menuData)
  return response.data
}

export const deleteMenu = async (id: string): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`/menus/${id}`)
  return response.data
}

export const assignMenuToRole = async (menuId: string, roleId: string): Promise<ApiResponse<void>> => {
  const response = await apiClient.post<ApiResponse<void>>(`/menus/${menuId}/assign/${roleId}`)
  return response.data
}

export const removeMenuFromRole = async (menuId: string, roleId: string): Promise<ApiResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(`/menus/${menuId}/assign/${roleId}`)
  return response.data
}

export const getMenusByRole = async (roleId: string): Promise<ApiResponse<Menu[]>> => {
  const response = await apiClient.get<ApiResponse<Menu[]>>(`/menus/role/${roleId}`)
  return response.data
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

// Logbook API service
export class LogbookService {
  private static readonly BASE_PATH = "/logbooks"

  static async getAllLogbooks(page: number = 1, limit: number = 10, search?: string): Promise<PaginatedResponse<Logbook>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    if (search) {
      params.append("search", search)
    }
    const response = await apiClient.get<PaginatedResponse<Logbook>>(`${this.BASE_PATH}?${params}`)
    return response.data
  }

  static async getLogbookById(id: string): Promise<ApiResponse<Logbook>> {
    const response = await apiClient.get<ApiResponse<Logbook>>(`${this.BASE_PATH}/${id}`)
    return response.data
  }

  static async createLogbook(data: CreateLogbookRequest): Promise<ApiResponse<Logbook>> {
    const response = await apiClient.post<ApiResponse<Logbook>>(this.BASE_PATH, data)
    return response.data
  }

  static async updateLogbook(id: string, data: UpdateLogbookRequest): Promise<ApiResponse<Logbook>> {
    const response = await apiClient.patch<ApiResponse<Logbook>>(`${this.BASE_PATH}/${id}`, data)
    return response.data
  }

  static async deleteLogbook(id: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`${this.BASE_PATH}/${id}`)
    return response.data
  }

  // Permission management
  static async setUserPermissions(logbookId: string, data: LogbookPermissionRequest): Promise<ApiResponse<UserLogbook>> {
    const response = await apiClient.post<ApiResponse<UserLogbook>>(`${this.BASE_PATH}/${logbookId}/permissions`, data)
    return response.data
  }

  static async getUserPermissions(logbookId: string, userId: string): Promise<ApiResponse<{ canAdd: boolean; canRead: boolean; canUpdate: boolean; canDelete: boolean }>> {
    const response = await apiClient.get<ApiResponse<{ canAdd: boolean; canRead: boolean; canUpdate: boolean; canDelete: boolean }>>(`${this.BASE_PATH}/${logbookId}/permissions/${userId}`)
    return response.data
  }

  static async removeUserPermissions(logbookId: string, userId: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`${this.BASE_PATH}/${logbookId}/permissions/${userId}`)
    return response.data
  }

  // Customer management
  static async getLogbookCustomers(logbookId: string, page: number = 1, limit: number = 10, search?: string): Promise<PaginatedResponse<LogbookCustomer>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    if (search) {
      params.append("search", search)
    }
    const response = await apiClient.get<PaginatedResponse<LogbookCustomer>>(`${this.BASE_PATH}/${logbookId}/customers?${params}`)
    return response.data
  }

  static async addCustomerToLogbook(logbookId: string, data: AddCustomerToLogbookRequest): Promise<ApiResponse<LogbookCustomer>> {
    const response = await apiClient.post<ApiResponse<LogbookCustomer>>(`${this.BASE_PATH}/${logbookId}/customers`, data)
    return response.data
  }

  static async removeCustomerFromLogbook(logbookId: string, customerId: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`${this.BASE_PATH}/${logbookId}/customers/${customerId}`)
    return response.data
  }

  // Set default logbook for current user
  static async setDefaultLogbook(logbookId: string): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>(`${this.BASE_PATH}/${logbookId}/set-default`, {})
    return response.data
  }
}
