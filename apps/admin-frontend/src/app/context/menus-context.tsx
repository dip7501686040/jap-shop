"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import { getUserMenus, Menu } from "@/lib/api-services"

interface MenusContextType {
  menus: Menu[]
  loading: boolean
  error: string | null
  refetchMenus: () => Promise<void>
}

const MenusContext = createContext<MenusContextType | undefined>(undefined)

interface MenusProviderProps {
  children: ReactNode
}

export function MenusProvider({ children }: MenusProviderProps) {
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMenus = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getUserMenus()
      if (response.success) {
        setMenus(response.data)
      } else {
        setError("Failed to fetch menus")
      }
    } catch (err) {
      setError("Failed to fetch menus")
      console.error("Error fetching user menus:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const refetchMenus = useCallback(async () => {
    await fetchMenus()
  }, [fetchMenus])

  useEffect(() => {
    fetchMenus()
  }, [fetchMenus])

  const value = {
    menus,
    loading,
    error,
    refetchMenus
  }

  return <MenusContext.Provider value={value}>{children}</MenusContext.Provider>
}

export function useMenusContext() {
  const context = useContext(MenusContext)
  if (context === undefined) {
    throw new Error("useMenusContext must be used within a MenusProvider")
  }
  return context
}

// Keep the original hook for backward compatibility, but now it uses the context
export const useUserMenus = () => {
  return useMenusContext()
}
