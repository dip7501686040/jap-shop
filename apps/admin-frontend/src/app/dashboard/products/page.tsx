import ComingSoon from "@/app/components/CommingSoon"
import { ProtectedRoute } from "@/app/components/ProtectedRoute"
import React from "react"

function Products() {
  return (
    <ProtectedRoute requiredPermission="products">
      <ComingSoon />
    </ProtectedRoute>
  )
}

export default Products
