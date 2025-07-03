"use client"
import { useState, useEffect } from "react"
import { getAllMenus, createMenu, updateMenu, deleteMenu, getAllRoles, Menu, Role } from "@/lib/api-services"
import { Trash2, Edit, Plus, X } from "lucide-react"

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    href: "",
    icon: "",
    order: 0,
    isActive: true,
    parentId: "",
    roleIds: [] as string[]
  })

  const fetchMenus = async () => {
    try {
      const response = await getAllMenus()
      if (response.success) {
        setMenus(response.data)
      }
    } catch (error) {
      console.error("Error fetching menus:", error)
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await getAllRoles()
      if (response.success) {
        setRoles(response.data)
      }
    } catch (error) {
      console.error("Error fetching roles:", error)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await Promise.all([fetchMenus(), fetchRoles()])
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const menuData = {
        ...formData,
        order: Number(formData.order),
        parentId: formData.parentId || undefined,
        roleIds: formData.roleIds.length > 0 ? formData.roleIds : undefined
      }

      if (editingMenu) {
        await updateMenu(editingMenu.id, menuData)
      } else {
        await createMenu(menuData)
      }

      await fetchMenus()
      resetForm()
    } catch (error) {
      console.error("Error saving menu:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this menu?")) {
      try {
        await deleteMenu(id)
        await fetchMenus()
      } catch (error) {
        console.error("Error deleting menu:", error)
      }
    }
  }

  const handleEdit = (menu: Menu) => {
    setEditingMenu(menu)
    setFormData({
      name: menu.name,
      href: menu.href,
      icon: menu.icon || "",
      order: menu.order,
      isActive: menu.isActive,
      parentId: menu.parentId || "",
      roleIds: menu.roleMenus?.map((rm) => rm.roleId) || []
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      href: "",
      icon: "",
      order: 0,
      isActive: true,
      parentId: "",
      roleIds: []
    })
    setEditingMenu(null)
    setShowModal(false)
  }

  const handleRoleToggle = (roleId: string) => {
    setFormData((prev) => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId) ? prev.roleIds.filter((id) => id !== roleId) : [...prev.roleIds, roleId]
    }))
  }

  if (loading) {
    return <div className="p-6">Loading menus...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Menu Management</h1>
        <button onClick={() => setShowModal(true)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2">
          <Plus size={16} />
          Add Menu
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Path</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {menus.map((menu) => (
              <tr key={menu.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{menu.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{menu.href}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{menu.order}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${menu.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {menu.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{menu.roleMenus?.map((rm) => rm.role.name).join(", ") || "No roles"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => handleEdit(menu)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(menu.id)} className="text-red-600 hover:text-red-900">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{editingMenu ? "Edit Menu" : "Add New Menu"}</h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Path (href)</label>
                <input
                  type="text"
                  value={formData.href}
                  onChange={(e) => setFormData((prev) => ({ ...prev, href: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData((prev) => ({ ...prev, order: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))} className="mr-2" />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Parent Menu</label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, parentId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No Parent</option>
                  {menus
                    .filter((m) => m.id !== editingMenu?.id)
                    .map((menu) => (
                      <option key={menu.id} value={menu.id}>
                        {menu.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Roles</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {roles.map((role) => (
                    <label key={role.id} className="flex items-center">
                      <input type="checkbox" checked={formData.roleIds.includes(role.id)} onChange={() => handleRoleToggle(role.id)} className="mr-2" />
                      <span className="text-sm text-gray-700">{role.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button type="button" onClick={resetForm} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">
                  {editingMenu ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
