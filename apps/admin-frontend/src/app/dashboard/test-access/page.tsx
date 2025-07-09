"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/app/context/auth-context"
import { useUserMenus } from "@/hooks/useUserMenus"
import { ApiService } from "@/lib/api-services"

interface UserAccessData {
  user: {
    id: string
    email: string
    name: string
    role: {
      id: string
      name: string
      description?: string
    }
  }
  accessibleMenus: Array<{
    id: string
    name: string
    href: string
    order: number
  }>
  menuCount: number
  menuNames: string[]
}

export default function TestUserAccessPage() {
  const { user } = useAuth()
  const { menus, loading, error } = useUserMenus()
  const [accessData, setAccessData] = useState<UserAccessData | null>(null)
  const [testLoading, setTestLoading] = useState(false)

  const runAccessTest = async () => {
    try {
      setTestLoading(true)
      const response = await ApiService.get<UserAccessData>("/auth/test-user-access")
      if (response.success) {
        setAccessData(response.data)
      }
    } catch (error) {
      console.error("Error running access test:", error)
    } finally {
      setTestLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      runAccessTest()
    }
  }, [user])

  if (!user) {
    return <div className="p-6">Please login to test user access</div>
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">User Access Test</h1>
        <p className="text-gray-600">This page helps verify that role-based menu access is working correctly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Current User Information</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Name:</span> {user.name}
            </p>
            <p>
              <span className="font-medium">Email:</span> {user.email}
            </p>
            <p>
              <span className="font-medium">Role:</span> {user.role?.name || "No role assigned"}
            </p>
            <p>
              <span className="font-medium">Role Description:</span> {user.role?.description || "N/A"}
            </p>
          </div>
        </div>

        {/* Menu Access via Hook */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Accessible Menus (via useUserMenus hook)</h2>
          {loading ? (
            <p className="text-gray-500">Loading menus...</p>
          ) : error ? (
            <p className="text-red-500">Error loading menus: {error}</p>
          ) : menus.length > 0 ? (
            <div>
              <p className="text-sm text-gray-600 mb-3">Total menus: {menus.length}</p>
              <div className="space-y-2">
                {menus.map((menu) => (
                  <div key={menu.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">{menu.name}</span>
                    <span className="text-sm text-gray-500">{menu.href}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No menus accessible to this role</p>
          )}
        </div>

        {/* API Test Results */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">API Access Test Results</h2>
            <button onClick={runAccessTest} disabled={testLoading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
              {testLoading ? "Testing..." : "Run Test"}
            </button>
          </div>

          {accessData ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <h3 className="font-medium text-green-800 mb-2">✅ Access Test Successful</h3>
                <div className="text-sm text-green-700">
                  <p>
                    User <strong>{accessData.user.name}</strong> with role <strong>{accessData.user.role.name}</strong> has access to <strong>{accessData.menuCount}</strong> menus.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Role Information</h4>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="font-medium">Role ID:</span> {accessData.user.role.id}
                    </p>
                    <p>
                      <span className="font-medium">Role Name:</span> {accessData.user.role.name}
                    </p>
                    <p>
                      <span className="font-medium">Description:</span> {accessData.user.role.description || "N/A"}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Menu Access Summary</h4>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="font-medium">Total Accessible Menus:</span> {accessData.menuCount}
                    </p>
                    <p>
                      <span className="font-medium">Menu Names:</span>
                    </p>
                    <ul className="list-disc list-inside ml-2">
                      {accessData.menuNames.map((name, index) => (
                        <li key={index}>{name}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Detailed Menu Information</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Path</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {accessData.accessibleMenus.map((menu) => (
                        <tr key={menu.id}>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">{menu.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{menu.href}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{menu.order}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Click &quot;Run Test&quot; to test API access</p>
          )}
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-medium text-blue-800 mb-2">Test Instructions</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p>
            1. <strong>Test with Different Roles:</strong> Login with users having different roles (SuperAdmin, admin, user) to verify menu access.
          </p>
          <p>
            2. <strong>Verify Menu Filtering:</strong> Each role should only see menus assigned to their role.
          </p>
          <p>
            3. <strong>Check Consistency:</strong> Both the sidebar and this test page should show the same menus.
          </p>
          <p>
            4. <strong>Test Role Management:</strong> Use the Role Management page to assign/remove menus and verify changes.
          </p>
        </div>
      </div>
    </div>
  )
}
