"use client"

import { useAuth } from "@/app/context/auth-context"

export interface RolePermissions {
  [key: string]: boolean
}

export function useRolePermissions(): RolePermissions {
  const { user } = useAuth()

  // Return permissions from the user object (fetched from DB)
  if (user?.rolePermissions) {
    return user.rolePermissions
  }

  // Fallback: no permissions
  return {}
}

export function useIsSuperAdmin(): boolean {
  const { user } = useAuth()
  return user?.role?.name === "superAdmin"
}

export function useIsAdmin(): boolean {
  const { user } = useAuth()
  return user?.role?.name === "admin" || user?.role?.name === "superAdmin"
}

export function useCanAccess(permission: keyof RolePermissions): boolean {
  const permissions = useRolePermissions()
  return permissions[permission]
}

export function useMenuPermissions() {
  const { user } = useAuth()
  return user?.menuPermissions || {}
}

export function useUserMenus() {
  const { user } = useAuth()
  return user?.userMenus || []
}

export function useCanPerformAction(menuName: string, action: "canAdd" | "canRead" | "canUpdate" | "canDelete"): boolean {
  const menuPermissions = useMenuPermissions()
  return menuPermissions[menuName]?.[action] || false
}
