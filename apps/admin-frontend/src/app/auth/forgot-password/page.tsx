"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      // Mock password reset - Replace with actual reset functionality later
      if (email) {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 800))
        setSuccess(true)
      } else {
        setError("Please enter a valid email address")
      }
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold">Reset your password</h2>
            <p className="mt-2 text-center text-sm text-gray-600">Enter your email and we&apos;ll send you a link to reset your password</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <div className="flex">
                <div className="text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
              <div className="flex">
                <div className="text-green-700">
                  <p>Password reset link has been sent to your email</p>
                </div>
              </div>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {loading ? "Sending reset link..." : "Send reset link"}
              </button>
            </div>

            <div className="text-center">
              <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                Back to sign in
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Image/Banner */}
      <div className="hidden md:block md:w-1/2 bg-blue-600">
        <div className="flex items-center justify-center h-full px-4 py-12">
          <div className="max-w-md w-full space-y-8 text-white">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-6">Forgot Password?</h1>
              <p className="text-xl mb-10">Don&apos;t worry, we&apos;ll help you get back into your account</p>
              <div className="flex justify-center">
                <Image src="/window.svg" alt="Forgot password illustration" width={300} height={300} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
