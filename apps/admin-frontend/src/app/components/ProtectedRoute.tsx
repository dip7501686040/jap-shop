"use client"

import { ReactNode } from "react"
import { useRolePermissions, type RolePermissions } from "@/hooks/useRolePermissions"
import { Shield } from "lucide-react"

interface ProtectedRouteProps {
  children: ReactNode
  requiredPermission: keyof RolePermissions
  fallback?: ReactNode
}

export function ProtectedRoute({ children, requiredPermission, fallback }: ProtectedRouteProps) {
  const permissions = useRolePermissions()
  const hasPermission = permissions[requiredPermission]

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

interface RoleBasedComponentProps {
  children: ReactNode
  requiredPermission: keyof RolePermissions
  fallback?: ReactNode
}

export function RoleBasedComponent({ children, requiredPermission, fallback = null }: RoleBasedComponentProps) {
  const permissions = useRolePermissions()
  const hasPermission = permissions[requiredPermission]

  if (!hasPermission) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
