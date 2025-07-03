"use client"
import Link from "next/link"
import { useAuth } from "../context/auth-context"
import { useUserMenus } from "@/hooks/useUserMenus"
import { Power } from "lucide-react"

interface SidebarProps {
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function Sidebar({ setSidebarOpen }: SidebarProps) {
  const { logout } = useAuth()
  const { menus, loading, error } = useUserMenus()

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
        <nav className="flex-1">
          <ul className="space-y-2">
            {menus.map((menu) => (
              <li key={menu.id} onClick={() => setSidebarOpen(false)} className="hover:bg-gray-800 transition-colors">
                <Link href={menu.href} className="block rounded px-4 py-2 hover:bg-gray-700 transition-colors" prefetch={false}>
                  {menu.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto text-xs text-gray-400 text-center">&copy; {new Date().getFullYear()} Jap Shop</div>
      </aside>
    </div>
  )
}
