"use client"

import { useState, useEffect } from "react"
import { RoleService, Role, getAllMenus, Menu, assignMenuToRole, removeMenuFromRole, getMenusByRole } from "@/lib/api-services"
import { ProtectedRoute } from "@/app/components/ProtectedRoute"
import { Shield, Edit, Trash2, Plus, Settings } from "lucide-react"
import { useAuth } from "@/app/context/auth-context"
import { useUserMenus } from "@/hooks/useUserMenus"

interface EditRoleData {
  name?: string
  description?: string
}

interface CreateRoleData {
  name: string
  description?: string
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [editRole, setEditRole] = useState<Role | null>(null)
  const [deleteRole, setDeleteRole] = useState<Role | null>(null)
  const [createRole, setCreateRole] = useState(false)
  const [manageMenusRole, setManageMenusRole] = useState<Role | null>(null)
  const [roleMenus, setRoleMenus] = useState<Menu[]>([])
  const [editData, setEditData] = useState<EditRoleData>({})
  const [createData, setCreateData] = useState<CreateRoleData>({ name: "" })
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Get auth context and user menus hook for refreshing data
  const { user, refreshUser } = useAuth()
  const { refetch: refetchMenus } = useUserMenus()

  useEffect(() => {
    loadRoles()
    loadMenus()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const loadMenus = async () => {
    try {
      const response = await getAllMenus()
      if (response.success) {
        setMenus(response.data)
      }
    } catch (error) {
      console.error("Error loading menus:", error)
    }
  }

  const loadRoles = async () => {
    try {
      setLoading(true)
      const response = await RoleService.getRoles()

      if (response.success) {
        setRoles(response.data)
      }
    } catch (error) {
      console.error("Error loading roles:", error)
      showMessage("error", "Failed to load roles")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (role: Role) => {
    setEditRole(role)
    setEditData({
      name: role.name,
      description: role.description
    })
  }

  const handleUpdateRole = async () => {
    if (!editRole) return

    try {
      const response = await RoleService.updateRole(editRole.id, editData)

      if (response.success) {
        showMessage("success", "Role updated successfully")
        setEditRole(null)
        setEditData({})
        await loadRoles()
      } else {
        showMessage("error", response.message || "Failed to update role")
      }
    } catch (error) {
      console.error("Error updating role:", error)
      showMessage("error", "Failed to update role")
    }
  }

  const handleCreateRole = async () => {
    if (!createData.name.trim()) {
      showMessage("error", "Role name is required")
      return
    }

    try {
      const response = await RoleService.createRole(createData)

      if (response.success) {
        showMessage("success", "Role created successfully")
        setCreateRole(false)
        setCreateData({ name: "" })
        await loadRoles()
      } else {
        showMessage("error", response.message || "Failed to create role")
      }
    } catch (error) {
      console.error("Error creating role:", error)
      showMessage("error", "Failed to create role")
    }
  }

  const handleDeleteRole = async () => {
    if (!deleteRole) return

    try {
      const response = await RoleService.deleteRole(deleteRole.id)

      if (response.success) {
        showMessage("success", "Role deleted successfully")
        setDeleteRole(null)
        await loadRoles()
      } else {
        showMessage("error", response.message || "Failed to delete role")
      }
    } catch (error) {
      console.error("Error deleting role:", error)
      showMessage("error", "Failed to delete role")
    }
  }

  const handleManageMenus = async (role: Role) => {
    setManageMenusRole(role)
    try {
      const response = await getMenusByRole(role.id)
      if (response.success) {
        setRoleMenus(response.data)
      }
    } catch (error) {
      console.error("Error loading role menus:", error)
      setRoleMenus([])
    }
  }

  const handleMenuToggle = async (menuId: string, isAssigned: boolean) => {
    if (!manageMenusRole) return

    try {
      if (isAssigned) {
        await removeMenuFromRole(menuId, manageMenusRole.id)
        setRoleMenus((prev) => prev.filter((menu) => menu.id !== menuId))
        showMessage("success", "Menu removed from role successfully")
      } else {
        await assignMenuToRole(menuId, manageMenusRole.id)
        const menuToAdd = menus.find((menu) => menu.id === menuId)
        if (menuToAdd) {
          setRoleMenus((prev) => [...prev, menuToAdd])
        }
        showMessage("success", "Menu assigned to role successfully")
      }

      // Check if the currently logged-in user's role is affected by this change
      if (user?.role?.id === manageMenusRole.id) {
        // Refresh user data to get updated permissions
        await refreshUser()
        // Refresh sidebar menus
        await refetchMenus()
      }
    } catch (error) {
      console.error("Error managing menu assignment:", error)
      showMessage("error", "Failed to update menu assignment")
    }
  }

  const isMenuAssigned = (menuId: string) => {
    return roleMenus.some((menu) => menu.id === menuId)
  }

  const getRoleColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case "superadmin":
        return "bg-red-100 text-red-800 border-red-200"
      case "admin":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "user":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <ProtectedRoute requiredPermission="roles">
      <div className="p-6">
        {message && <div className={`mb-4 p-4 rounded ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{message.text}</div>}

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Roles</h1>
          </div>
          <button onClick={() => setCreateRole(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Add Role
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading roles...</p>
            </div>
          ) : roles.length === 0 ? (
            <div className="p-8 text-center">
              <Shield className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No roles</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new role.</p>
            </div>
          ) : (
            <div className="grid gap-4 p-6">
              {roles.map((role) => (
                <div key={role.id} className={`border rounded-lg p-4 ${getRoleColor(role.name)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{role.name}</h3>
                      {role.description && <p className="text-sm opacity-75 mt-1">{role.description}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(role)} className="p-2 hover:bg-white hover:bg-opacity-20 rounded" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleManageMenus(role)} className="p-2 hover:bg-white hover:bg-opacity-20 rounded" title="Manage Menus">
                        <Settings className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteRole(role)} className="p-2 hover:bg-white hover:bg-opacity-20 rounded text-red-600" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Role Modal */}
        {createRole && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">Create Role</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={createData.name}
                    onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter role name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={createData.description || ""}
                    onChange={(e) => setCreateData({ ...createData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter role description"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => {
                    setCreateRole(false)
                    setCreateData({ name: "" })
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button onClick={handleCreateRole} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Create Role
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Role Modal */}
        {editRole && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">Edit Role</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editData.name || ""}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editData.description || ""}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button onClick={() => setEditRole(null)} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleUpdateRole} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Update Role
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Role Modal */}
        {deleteRole && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
              <h2 className="text-lg font-semibold mb-4">Delete Role</h2>
              <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete the role &quot;{deleteRole.name}&quot;? This action cannot be undone.</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setDeleteRole(null)} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleDeleteRole} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manage Menus Modal */}
        {manageMenusRole && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
              <h2 className="text-lg font-semibold mb-4">Manage Menus for {manageMenusRole.name}</h2>
              <div className="space-y-4">
                {menus.length === 0 ? (
                  <p className="text-sm text-gray-500">No menus available. Please create some menus first.</p>
                ) : (
                  menus.map((menu) => (
                    <div key={menu.id} className="flex items-center justify-between p-2 border-b">
                      <div>
                        <p className="text-sm font-medium">{menu.name}</p>
                        <p className="text-xs text-gray-500">{menu.href}</p>
                      </div>
                      <button
                        onClick={() => handleMenuToggle(menu.id, isMenuAssigned(menu.id))}
                        className={`px-3 py-1 text-xs rounded-full font-semibold ${isMenuAssigned(menu.id) ? "bg-red-600 text-white" : "bg-blue-600 text-white"}`}
                      >
                        {isMenuAssigned(menu.id) ? "Remove" : "Assign"}
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setManageMenusRole(null)} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
