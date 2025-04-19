"use client"

import { useAuth } from "../context/auth-context"
import ProtectedRoute from "../components/auth/protected-route"

export default function DashboardPage() {
  const { user, logout } = useAuth()

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Logout
              </button>
            </div>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="border-4 border-dashed border-gray-200 rounded-lg p-6 min-h-[80vh]">
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-4">Welcome to the Admin Dashboard</h2>
                  <p className="text-gray-600">
                    You are now logged in as {user?.email} with role: {user?.role}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium mb-2">Quick Stats</h3>
                    <div className="text-3xl font-bold text-blue-600">128</div>
                    <p className="text-gray-500">Total Users</p>
                  </div>
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium mb-2">Analytics</h3>
                    <div className="text-3xl font-bold text-green-600">56%</div>
                    <p className="text-gray-500">Conversion Rate</p>
                  </div>
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium mb-2">Revenue</h3>
                    <div className="text-3xl font-bold text-purple-600">$12,428</div>
                    <p className="text-gray-500">Monthly</p>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((item) => (
                      <div key={item} className="flex items-center p-3 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mr-3">{item}</div>
                        <div>
                          <p className="font-medium">Activity {item}</p>
                          <p className="text-sm text-gray-500">{new Date(Date.now() - item * 3600000).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
