"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname, useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "../context/auth-context"
import { useLogbook } from "../context/logbook-context"
import { useUserMenus } from "@/hooks/useUserMenus"
import { Power, ChevronDown, ChevronRight, BookOpen, Settings } from "lucide-react"

interface SidebarProps {
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function Sidebar({ setSidebarOpen }: SidebarProps) {
  const { logout } = useAuth()
  const { menus, loading, error } = useUserMenus()
  const { logbooks, selectedLogbook, setSelectedLogbook, fetchLogbooks } = useLogbook()
  const [logbooksExpanded, setLogbooksExpanded] = useState(false)

  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    fetchLogbooks()
  }, [])

  // Check if current page is related to logbooks and expand accordingly
  useEffect(() => {
    const logbookId = searchParams.get("logbookId")
    if (pathname === "/dashboard/customers" && logbookId) {
      setLogbooksExpanded(true)
      // Find and set the selected logbook if not already set
      const currentLogbook = logbooks.find((lb) => lb.id === logbookId)
      if (currentLogbook && selectedLogbook?.id !== logbookId) {
        setSelectedLogbook(currentLogbook)
      }
    }
  }, [pathname, searchParams, logbooks])

  // Helper function to check if a logbook is currently selected based on URL
  const isLogbookSelected = (logbookId: string) => {
    const urlLogbookId = searchParams.get("logbookId")
    return pathname === "/dashboard/customers" && urlLogbookId === logbookId
  }

  // Helper function to check if a menu item is selected
  const isMenuSelected = (menuHref: string) => {
    // Exact match for the href
    if (pathname === menuHref) {
      return true
    }

    // For sub-paths, check if the current path starts with the menu href
    // but make sure it's not the root dashboard or it would match everything
    if (menuHref !== "/dashboard" && pathname.startsWith(menuHref + "/")) {
      return true
    }

    return false
  }

  if (loading) {
    return (
      <div className="flex h-screen">
        <aside className="w-64 bg-gray-900 text-white flex flex-col py-8 px-4 shadow-lg overflow-hidden">
          <div className="flex justify-between mb-10 text-xl font-bold tracking-wide">
            <Link href="/dashboard" className="flex items-center justify-center space-x-2 text-white hover:text-gray-300 transition-colors" onClick={() => setSidebarOpen(false)}>
              <span>Admin Panel</span>
            </Link>
            <Power onClick={logout} className="inline-block text-red-500 cursor-pointer" />
          </div>
          <nav className="flex-1">
            <div className="text-center text-gray-400">Loading menus...</div>
          </nav>
          <div className="mt-auto text-xs text-gray-400 text-center">&copy; {new Date().getFullYear()} Jap Shop</div>
        </aside>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen">
        <aside className="w-64 bg-gray-900 text-white flex flex-col py-8 px-4 shadow-lg overflow-hidden">
          <div className="flex justify-between mb-10 text-xl font-bold tracking-wide">
            <Link href="/dashboard" className="flex items-center justify-center space-x-2 text-white hover:text-gray-300 transition-colors" onClick={() => setSidebarOpen(false)}>
              <span>Admin Panel</span>
            </Link>
            <Power onClick={logout} className="inline-block text-red-500 cursor-pointer" />
          </div>
          <nav className="flex-1">
            <div className="text-center text-red-400">Error loading menus</div>
          </nav>
          <div className="mt-auto text-xs text-gray-400 text-center">&copy; {new Date().getFullYear()} Jap Shop</div>
        </aside>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-900 text-white flex flex-col py-8 px-4 shadow-lg overflow-hidden">
        <div className="flex justify-between mb-10 text-xl font-bold tracking-wide">
          <Link href="/dashboard" className="flex items-center justify-center space-x-2 text-white hover:text-gray-300 transition-colors" onClick={() => setSidebarOpen(false)}>
            <span>Admin Panel</span>
          </Link>
          <Power onClick={logout} className="inline-block text-red-500 cursor-pointer" />
        </div>
        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {/* Regular menu items */}
            {menus.map((menu) => (
              <li key={menu.id} onClick={() => setSidebarOpen(false)} className="hover:bg-gray-800 transition-colors">
                <Link href={menu.href} className={`block rounded px-4 py-2 hover:bg-gray-700 transition-colors ${isMenuSelected(menu.href) ? "bg-gray-700 text-white" : "text-gray-300"}`} prefetch={false}>
                  {menu.name}
                </Link>
              </li>
            ))}

            {/* Logbooks Section */}
            <li className="pt-4">
              <button onClick={() => setLogbooksExpanded(!logbooksExpanded)} className="flex items-center justify-between w-full px-4 py-2 text-left hover:bg-gray-700 rounded transition-colors">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Logbooks</span>
                </div>
                {logbooksExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              {logbooksExpanded && (
                <ul className="ml-6 mt-2 space-y-1">
                  {logbooks.map((logbook) => (
                    <li key={logbook.id}>
                      <button
                        onClick={() => {
                          setSelectedLogbook(logbook)
                          setSidebarOpen(false)
                          router.push(`/dashboard/customers?logbookId=${logbook.id}`)
                        }}
                        className={`block w-full text-left px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors ${isLogbookSelected(logbook.id) ? "bg-gray-700 text-white" : "text-gray-300"}`}
                      >
                        {logbook.name}
                      </button>
                    </li>
                  ))}
                  {logbooks.length === 0 && <li className="px-3 py-1 text-sm text-gray-400">No logbooks available</li>}
                </ul>
              )}
            </li>

            {/* Logbook Management Section */}
            <li className="pt-2">
              <Link
                href="/dashboard/logbook-management"
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-2 px-4 py-2 rounded hover:bg-gray-700 transition-colors ${isMenuSelected("/dashboard/logbook-management") ? "bg-gray-700 text-white" : "text-gray-300"}`}
              >
                <Settings className="w-4 h-4" />
                <span>Logbook Management</span>
              </Link>
            </li>
          </ul>
        </nav>
        <div className="mt-auto text-xs text-gray-400 text-center">&copy; {new Date().getFullYear()} Jap Shop</div>
      </aside>
    </div>
  )
}
