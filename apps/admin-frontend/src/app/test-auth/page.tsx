"use client"

import { useState } from "react"
import { AuthService, type LoginRequest, type SignupRequest } from "@/lib/api-services"
import { tokenStorage } from "@/lib/cookies"
import ProtectedRoute from "@/app/components/auth/protected-route"

export default function AuthTestPage() {
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

  const testSignup = async () => {
    setLoading(true)
    try {
      const signupData: SignupRequest = {
        name: "Frontend UI Test",
        email: "uitest@example.com",
        password: "password123"
      }
      const response = await AuthService.signup(signupData)
      setResult(JSON.stringify(response, null, 2))
    } catch (error) {
      setResult(`Error: ${error}`)
    }
    setLoading(false)
  }

  const testLogin = async () => {
    setLoading(true)
    try {
      const loginData: LoginRequest = {
        email: "frontend@test.com",
        password: "password123"
      }
      const response = await AuthService.login(loginData)
      setResult(JSON.stringify(response, null, 2))

      // Store tokens in cookies
      if (response.success && response.data) {
        tokenStorage.setAccessToken(response.data.accessToken)
        tokenStorage.setRefreshToken(response.data.refreshToken)
      }
    } catch (error) {
      setResult(`Error: ${error}`)
    }
    setLoading(false)
  }

  const testGetCurrentUser = async () => {
    setLoading(true)
    try {
      const response = await AuthService.getCurrentUser()
      setResult(JSON.stringify(response, null, 2))
    } catch (error) {
      setResult(`Error: ${error}`)
    }
    setLoading(false)
  }

  const testRefreshToken = async () => {
    setLoading(true)
    try {
      const refreshToken = tokenStorage.getRefreshToken()
      if (!refreshToken) {
        setResult("No refresh token found")
        setLoading(false)
        return
      }
      const response = await AuthService.refreshToken(refreshToken)
      setResult(JSON.stringify(response, null, 2))
    } catch (error) {
      setResult(`Error: ${error}`)
    }
    setLoading(false)
  }

  const clearTokens = () => {
    tokenStorage.clearTokens()
    setResult("Tokens cleared")
  }

  const checkTokens = () => {
    const accessToken = tokenStorage.getAccessToken()
    const refreshToken = tokenStorage.getRefreshToken()
    setResult(`Access Token: ${accessToken ? "Present" : "Not found"}\nRefresh Token: ${refreshToken ? "Present" : "Not found"}`)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Authentication Test Page</h1>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button onClick={testSignup} disabled={loading} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50">
              Test Signup
            </button>

            <button onClick={testLogin} disabled={loading} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50">
              Test Login
            </button>

            <button onClick={testGetCurrentUser} disabled={loading} className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50">
              Test Get Current User
            </button>

            <button onClick={testRefreshToken} disabled={loading} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-50">
              Test Refresh Token
            </button>

            <button onClick={checkTokens} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              Check Tokens
            </button>

            <button onClick={clearTokens} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
              Clear Tokens
            </button>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Result:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">{loading ? "Loading..." : result}</pre>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
