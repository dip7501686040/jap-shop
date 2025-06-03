"use client"
import Link from "next/link"
import { useAuth } from "../context/auth-context"
import { Power } from "lucide-react"

const navItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Customers", href: "/dashboard/customers" },
  { name: "Products", href: "/dashboard/products" },
  { name: "Orders", href: "/dashboard/orders" },
  { name: "Settings", href: "/dashboard/settings" }
]

interface SidebarProps {
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function Sidebar({ setSidebarOpen }: SidebarProps) {
  const { logout } = useAuth()

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
            {navItems.map((item) => (
              <li key={item.name} onClick={() => setSidebarOpen(false)} className="hover:bg-gray-800 transition-colors">
                <Link href={item.href} className="block rounded px-4 py-2 hover:bg-gray-700 transition-colors" prefetch={false}>
                  {item.name}
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
