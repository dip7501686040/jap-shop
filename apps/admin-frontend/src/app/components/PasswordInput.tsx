"use client"

import { useCallback } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/app/context/auth-context"

interface PasswordInputProps {
  id: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string
  autoComplete?: string
  required?: boolean
  minLength?: number
  className?: string
  label?: string
  showLabel?: boolean
}

export default function PasswordInput({
  id,
  name,
  value,
  onChange,
  placeholder,
  autoComplete = "current-password",
  required = false,
  minLength,
  className = "appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-white-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm",
  label,
  showLabel = false
}: PasswordInputProps) {
  const { passwordVisibility, togglePasswordVisibility } = useAuth()
  const showPassword = passwordVisibility[id] || false

  const handleToggleVisibility = useCallback(() => {
    togglePasswordVisibility(id)
  }, [id, togglePasswordVisibility])

  return (
    <div className="relative" key={id}>
      {showLabel && label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      {!showLabel && label && (
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={showPassword ? "text" : "password"}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        className={className}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={handleToggleVisibility} tabIndex={-1} aria-label={showPassword ? "Hide password" : "Show password"}>
        {showPassword ? <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" aria-hidden="true" /> : <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" aria-hidden="true" />}
      </button>
    </div>
  )
}
