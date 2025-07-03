"use client"
import { useAuth } from "@/app/context/auth-context"

export const useUserMenus = () => {
  const { menus, menuLoading, menuError, refetchMenus } = useAuth()

  return {
    menus,
    loading: menuLoading,
    error: menuError,
    refetch: refetchMenus
  }
}
