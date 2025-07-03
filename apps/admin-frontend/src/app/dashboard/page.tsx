"use client"

import { useAuth } from "../context/auth-context"
import { useRolePermissions } from "@/hooks/useRolePermissions"
import { ProtectedRoute } from "../components/ProtectedRoute"
import Link from "next/link"
import { Users, Shield, Package, ShoppingBag, Settings, UserCheck } from "lucide-react"

function DashboardContent() {
  const { user } = useAuth()
  const permissions = useRolePermissions()

  const getAvailableActions = () => {
    const actions = []

    if (permissions.customers) {
      actions.push({
        title: "Manage Customers",
        description: "View and manage customer accounts",
        href: "/dashboard/customers",
        icon: UserCheck,
        color: "blue"
      })
    }

    if (permissions.users) {
      actions.push({
        title: "Manage Users",
        description: "Add, edit, and assign roles to users",
        href: "/dashboard/users",
        icon: Users,
        color: "green"
      })
    }

    if (permissions.roles) {
      actions.push({
        title: "Manage Roles",
        description: "Create and manage user roles",
        href: "/dashboard/roles",
        icon: Shield,
        color: "purple"
      })
    }

    if (permissions.products) {
      actions.push({
        title: "Manage Products",
        description: "Add and manage product catalog",
        href: "/dashboard/products",
        icon: Package,
        color: "orange"
      })
    }

    if (permissions.orders) {
      actions.push({
        title: "Manage Orders",
        description: "View and process orders",
        href: "/dashboard/orders",
        icon: ShoppingBag,
        color: "red"
      })
    }

    if (permissions.settings) {
      actions.push({
        title: "Settings",
        description: "Configure system settings",
        href: "/dashboard/settings",
        icon: Settings,
        color: "gray"
      })
    }

    return actions
  }

  const availableActions = getAvailableActions()
  const roleDisplayName = user?.role?.name === "superAdmin" ? "Super Administrator" : user?.role?.name === "admin" ? "Administrator" : user?.role?.name || "No role assigned"

  return (
    <div className="min-h-screen bg-gray-100">
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Jap Shop Admin</h1>
              <p className="text-gray-600">
                Logged in as <span className="font-semibold">{user?.name}</span> ({user?.email})
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Role: <span className="font-medium text-blue-600">{roleDisplayName}</span>
              </p>
            </div>

            {availableActions.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableActions.map((action) => {
                    const Icon = action.icon
                    return (
                      <Link key={action.href} href={action.href} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-center mb-3">
                          <Icon className={`h-8 w-8 text-${action.color}-600 mr-3`} />
                          <h3 className="text-lg font-medium text-gray-900">{action.title}</h3>
                        </div>
                        <p className="text-gray-600">{action.description}</p>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium mb-2">Your Access Level</h3>
                <div className="text-3xl font-bold text-blue-600">{roleDisplayName}</div>
                <p className="text-gray-500">Current Role</p>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium mb-2">Available Features</h3>
                <div className="text-3xl font-bold text-green-600">{availableActions.length}</div>
                <p className="text-gray-500">Accessible Modules</p>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium mb-2">System Status</h3>
                <div className="text-3xl font-bold text-purple-600">Online</div>
                <p className="text-gray-500">All Systems Operational</p>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Quick Access</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {availableActions.slice(0, 4).map((action) => {
                  const Icon = action.icon
                  return (
                    <Link key={action.href} href={action.href} className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <Icon className={`h-8 w-8 text-${action.color}-600 mb-2`} />
                      <span className="text-sm font-medium text-gray-900">{action.title.replace("Manage ", "")}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute requiredPermission="dashboard">
      <DashboardContent />
    </ProtectedRoute>
  )
}
