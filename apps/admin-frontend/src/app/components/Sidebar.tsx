"use client"
import Link from "next/link"

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
  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-900 text-white flex flex-col py-8 px-4 shadow-lg overflow-hidden">
        <div className="mb-10 text-2xl font-bold tracking-wide text-center">Admin Panel</div>
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
