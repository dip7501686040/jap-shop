import React from "react"
import { useAuth } from "../context/auth-context"

function Header() {
  const { user, logout } = useAuth()
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex flex-row items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 w-full text-center md:text-left">Dashboard</h1>
        <div className="flex items-center space-x-4">
          {/* Hide welcome message on mobile */}
          <span className="text-gray-700 hidden md:inline">Welcome, {user?.name}</span>
          <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
