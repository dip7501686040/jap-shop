"use client"
import React, { useState, useEffect } from "react"
import { useAuth } from "@/app/context/auth-context"
import { useLogbook } from "@/app/context/logbook-context"
import { LogbookService, UserService, Logbook, User, CreateLogbookRequest, UpdateLogbookRequest, LogbookPermissionRequest } from "@/lib/api-services"
import { Plus, Edit, Trash2, Settings } from "lucide-react"

export default function LogbookManagementPage() {
  const { user } = useAuth()
  const { logbooks, fetchLogbooks, defaultLogbook, setDefaultLogbook } = useLogbook()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [selectedLogbook, setSelectedLogbook] = useState<Logbook | null>(null)
  const [users, setUsers] = useState<User[]>([])

  // Form states
  const [createForm, setCreateForm] = useState<CreateLogbookRequest>({ name: "", description: "" })
  const [editForm, setEditForm] = useState<UpdateLogbookRequest>({ name: "", description: "" })
  const [permissionForm, setPermissionForm] = useState<LogbookPermissionRequest>({
    userId: "",
    canAdd: false,
    canRead: true,
    canUpdate: false,
    canDelete: false
  })

  const isSuperAdmin = user?.role?.name === "superAdmin"

  useEffect(() => {
    fetchLogbooks()
    if (isSuperAdmin) {
      fetchUsers()
    }
  }, [isSuperAdmin])

  const fetchUsers = async () => {
    try {
      const response = await UserService.getUsers()
      setUsers(response.data)
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const handleCreateLogbook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isSuperAdmin) return

    try {
      setIsLoading(true)
      setError(null)
      await LogbookService.createLogbook(createForm)
      setCreateForm({ name: "", description: "" })
      setShowCreateModal(false)
      await fetchLogbooks()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create logbook")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateLogbook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isSuperAdmin || !selectedLogbook) return

    try {
      setIsLoading(true)
      setError(null)
      await LogbookService.updateLogbook(selectedLogbook.id, editForm)
      setShowEditModal(false)
      setSelectedLogbook(null)
      await fetchLogbooks()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update logbook")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteLogbook = async (logbook: Logbook) => {
    if (!isSuperAdmin) return

    if (!confirm(`Are you sure you want to delete "${logbook.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      await LogbookService.deleteLogbook(logbook.id)
      await fetchLogbooks()

      // If deleted logbook was the default, clear it
      if (defaultLogbook?.id === logbook.id) {
        setDefaultLogbook(null)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to delete logbook")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetPermissions = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isSuperAdmin || !selectedLogbook) return

    try {
      setIsLoading(true)
      setError(null)
      await LogbookService.setUserPermissions(selectedLogbook.id, permissionForm)
      setShowPermissionModal(false)
      setSelectedLogbook(null)
      setPermissionForm({
        userId: "",
        canAdd: false,
        canRead: true,
        canUpdate: false,
        canDelete: false
      })
      await fetchLogbooks()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to set permissions")
    } finally {
      setIsLoading(false)
    }
  }

  const openEditModal = (logbook: Logbook) => {
    setSelectedLogbook(logbook)
    setEditForm({ name: logbook.name, description: logbook.description || "" })
    setShowEditModal(true)
  }

  const openPermissionModal = (logbook: Logbook) => {
    setSelectedLogbook(logbook)
    setShowPermissionModal(true)
  }

  const handleSetDefaultLogbook = async (logbook: Logbook) => {
    try {
      setIsLoading(true)
      setError(null)
      await LogbookService.setDefaultLogbook(logbook.id)
      setDefaultLogbook(logbook)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to set default logbook")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 max-h-screen overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Logbook Management</h1>
        {isSuperAdmin && (
          <button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Create Logbook</span>
          </button>
        )}
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customers</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logbooks.map((logbook) => (
                <tr key={logbook.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{logbook.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{logbook.description || "-"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{logbook._count?.userLogbooks || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{logbook._count?.logbookCustomers || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleSetDefaultLogbook(logbook)}
                      className={`text-sm px-2 py-1 rounded ${defaultLogbook?.id === logbook.id ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800 hover:bg-gray-200"}`}
                    >
                      {defaultLogbook?.id === logbook.id ? "Default" : "Set Default"}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {isSuperAdmin && (
                        <>
                          <button onClick={() => openEditModal(logbook)} className="text-indigo-600 hover:text-indigo-900">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => openPermissionModal(logbook)} className="text-green-600 hover:text-green-900">
                            <Settings className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteLogbook(logbook)} className="text-red-600 hover:text-red-900">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Create New Logbook</h2>
            <form onSubmit={handleCreateLogbook}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setCreateForm({ name: "", description: "" })
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                  {isLoading ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedLogbook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Edit Logbook</h2>
            <form onSubmit={handleUpdateLogbook}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedLogbook(null)
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                  {isLoading ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permission Modal */}
      {showPermissionModal && selectedLogbook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Set User Permissions</h2>
            <form onSubmit={handleSetPermissions}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">User</label>
                <select
                  value={permissionForm.userId}
                  onChange={(e) => setPermissionForm({ ...permissionForm, userId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4 space-y-2">
                <div className="flex items-center">
                  <input type="checkbox" id="canRead" checked={permissionForm.canRead} onChange={(e) => setPermissionForm({ ...permissionForm, canRead: e.target.checked })} className="mr-2" />
                  <label htmlFor="canRead" className="text-sm">
                    Can Read
                  </label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="canAdd" checked={permissionForm.canAdd} onChange={(e) => setPermissionForm({ ...permissionForm, canAdd: e.target.checked })} className="mr-2" />
                  <label htmlFor="canAdd" className="text-sm">
                    Can Add
                  </label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="canUpdate" checked={permissionForm.canUpdate} onChange={(e) => setPermissionForm({ ...permissionForm, canUpdate: e.target.checked })} className="mr-2" />
                  <label htmlFor="canUpdate" className="text-sm">
                    Can Update
                  </label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="canDelete" checked={permissionForm.canDelete} onChange={(e) => setPermissionForm({ ...permissionForm, canDelete: e.target.checked })} className="mr-2" />
                  <label htmlFor="canDelete" className="text-sm">
                    Can Delete
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPermissionModal(false)
                    setSelectedLogbook(null)
                    setPermissionForm({
                      userId: "",
                      canAdd: false,
                      canRead: true,
                      canUpdate: false,
                      canDelete: false
                    })
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                  {isLoading ? "Setting..." : "Set Permissions"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
