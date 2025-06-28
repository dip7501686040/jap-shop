"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/app/context/auth-context"

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { verifyOtp, resendOtp, error: authError, isLoading } = useAuth()

  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
    } else {
      // If no email is provided, redirect to login
      router.push("/auth/login")
    }
  }, [searchParams, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!otp.trim()) {
      setError("Please enter the OTP")
      setLoading(false)
      return
    }

    try {
      const success = await verifyOtp(email, otp)
      if (success) {
        router.push("/dashboard")
      } else {
        setError(authError || "Invalid OTP. Please try again.")
      }
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setResendLoading(true)
    setResendMessage("")
    setError("")

    try {
      const success = await resendOtp(email)
      if (success) {
        setResendMessage("OTP has been resent to your email")
      } else {
        setError(authError || "Failed to resend OTP. Please try again.")
      }
    } catch {
      setError("An error occurred while resending OTP.")
    } finally {
      setResendLoading(false)
    }
  }

  const handleBackToLogin = () => {
    router.push("/auth/login")
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold">Verify OTP</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              We've sent a 6-digit verification code to <span className="font-medium text-blue-600">{email}</span>
            </p>
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

          {resendMessage && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
              <div className="flex">
                <div className="text-green-700">
                  <p>{resendMessage}</p>
                </div>
              </div>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="otp" className="sr-only">
                OTP Code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                maxLength={6}
                pattern="[0-9]{6}"
                autoComplete="one-time-code"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-white-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-lg text-center tracking-widest font-mono"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                  setOtp(value)
                }}
              />
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading || isLoading || otp.length !== 6}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {loading || isLoading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendLoading || isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                {resendLoading ? "Resending..." : "Resend OTP"}
              </button>

              <button
                type="button"
                onClick={handleBackToLogin}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-transparent hover:text-blue-500 focus:outline-none"
              >
                Back to Login
              </button>
            </div>
          </form>

          <div className="text-center text-sm text-gray-600">
            <p>Didn't receive the code? Check your spam folder or try resending.</p>
          </div>
        </div>
      </div>

      {/* Right side - Image/Banner */}
      <div className="hidden md:block md:w-1/2 bg-blue-600">
        <div className="flex items-center justify-center h-full px-4 py-12">
          <div className="max-w-md w-full space-y-8 text-white">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-6">Secure Access</h1>
              <p className="text-xl mb-10">Your security is our priority. Please verify your identity to continue.</p>
              <div className="flex justify-center">
                <Image src="/globe.svg" alt="Security illustration" width={300} height={300} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
