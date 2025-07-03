"use client"
import { useMenusContext } from "@/app/context/menus-context"

export const useUserMenus = () => {
  const { menus, loading, error, refetchMenus } = useMenusContext()

  return {
    menus,
    loading,
    error,
    refetch: refetchMenus
  }
}
