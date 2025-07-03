import ComingSoon from "@/app/components/CommingSoon"
import { ProtectedRoute } from "@/app/components/ProtectedRoute"
import React from "react"

function Settings() {
  return (
    <ProtectedRoute requiredPermission="settings">
      <ComingSoon />
    </ProtectedRoute>
  )
}

export default Settings
