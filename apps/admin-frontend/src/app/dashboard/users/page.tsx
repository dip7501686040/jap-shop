"use client"

import { useState, useEffect } from "react"
import { UserService, RoleService, User, Role, UpdateUserRequest } from "@/lib/api-services"
import { ProtectedRoute } from "@/app/components/ProtectedRoute"
import { Users, Edit, Trash2, Plus, Eye, EyeOff } from "lucide-react"

interface EditUserData extends UpdateUserRequest {
  password?: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [deleteUser, setDeleteUser] = useState<User | null>(null)
  const [editData, setEditData] = useState<EditUserData>({})
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    loadUsersAndRoles()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const loadUsersAndRoles = async () => {
    try {
      setLoading(true)
      const [usersResponse, rolesResponse] = await Promise.all([UserService.getUsers(), RoleService.getRoles()])

      if (usersResponse.success) {
        setUsers(usersResponse.data)
      }

      if (rolesResponse.success) {
        setRoles(rolesResponse.data)
      }
    } catch (error) {
      console.error("Error loading data:", error)
      showMessage("error", "Failed to load users and roles")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user: User) => {
    setEditUser(user)
    setEditData({
      name: user.name,
      email: user.email,
      roleId: user.roleId
    })
  }

  const handleUpdateUser = async () => {
    if (!editUser) return

    try {
      const response = await UserService.updateUser(editUser.id, editData)

      if (response.success) {
        showMessage("success", "User updated successfully")
        setEditUser(null)
        setEditData({})
        await loadUsersAndRoles()
      } else {
        showMessage("error", response.message || "Failed to update user")
      }
    } catch (error) {
      console.error("Error updating user:", error)
      showMessage("error", "Failed to update user")
    }
  }

  const handleDeleteUser = async () => {
    if (!deleteUser) return

    try {
      const response = await UserService.deleteUser(deleteUser.id)

      if (response.success) {
        showMessage("success", "User deleted successfully")
        setDeleteUser(null)
        await loadUsersAndRoles()
      } else {
        showMessage("error", response.message || "Failed to delete user")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      showMessage("error", "Failed to delete user")
    }
  }

  const getRoleName = (roleId?: string) => {
    if (!roleId) return "No Role"
    const role = roles.find((r) => r.id === roleId)
    return role?.name || "Unknown"
  }

  const getRoleColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case "superadmin":
        return "bg-red-100 text-red-800 px-2 py-1 rounded text-xs"
      case "admin":
        return "bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
      case "user":
        return "bg-green-100 text-green-800 px-2 py-1 rounded text-xs"
      default:
        return "bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs"
    }
  }

  return (
    <ProtectedRoute requiredPermission="users">
      <div className="p-6">
        {message && <div className={`mb-4 p-4 rounded ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{message.text}</div>}

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Users</h1>
          </div>
          <button onClick={() => (window.location.href = "/dashboard/users/create")} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Add User
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new user.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getRoleColor(getRoleName(user.roleId))}>{getRoleName(user.roleId)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEdit(user)} className="text-blue-600 hover:text-blue-900 p-1" title="Edit">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDeleteUser(user)} className="text-red-600 hover:text-red-900 p-1" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit User Modal */}
        {editUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">Edit User</h2>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editData.email || ""}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={editData.roleId || ""}
                    onChange={(e) => setEditData({ ...editData, roleId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password (optional)</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={editData.password || ""}
                      onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                      placeholder="Leave empty to keep current password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-2 text-gray-500 hover:text-gray-700">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button onClick={() => setEditUser(null)} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleUpdateUser} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Update User
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete User Modal */}
        {deleteUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
              <h2 className="text-lg font-semibold mb-4">Delete User</h2>
              <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete {deleteUser.name}? This action cannot be undone.</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setDeleteUser(null)} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleDeleteUser} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
