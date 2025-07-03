import ComingSoon from "@/app/components/CommingSoon"
import { ProtectedRoute } from "@/app/components/ProtectedRoute"
import React from "react"

function Orders() {
  return (
    <ProtectedRoute requiredPermission="orders">
      <ComingSoon />
    </ProtectedRoute>
  )
}

export default Orders
