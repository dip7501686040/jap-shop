"use client"
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { Logbook, LogbookService } from "@/lib/api-services"

interface LogbookContextType {
  selectedLogbook: Logbook | null
  setSelectedLogbook: (logbook: Logbook | null) => void
  defaultLogbook: Logbook | null
  setDefaultLogbook: (logbook: Logbook | null) => void
  logbooks: Logbook[]
  setLogbooks: (logbooks: Logbook[]) => void
  loading: boolean
  error: string | null
  fetchLogbooks: () => Promise<void>
}

const LogbookContext = createContext<LogbookContextType | null>(null)

export const useLogbook = () => {
  const context = useContext(LogbookContext)
  if (!context) {
    throw new Error("useLogbook must be used within a LogbookProvider")
  }
  return context
}

interface LogbookProviderProps {
  children: ReactNode
}

export function LogbookProvider({ children }: LogbookProviderProps) {
  const [selectedLogbook, setSelectedLogbook] = useState<Logbook | null>(null)
  const [defaultLogbook, setDefaultLogbook] = useState<Logbook | null>(null)
  const [logbooks, setLogbooks] = useState<Logbook[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLogbooks = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await LogbookService.getAllLogbooks(1, 100) // Get all logbooks
      setLogbooks(response.data)

      // Set default logbook from localStorage or first available logbook
      const savedDefaultLogbookId = localStorage.getItem("defaultLogbookId")
      if (savedDefaultLogbookId) {
        const defaultLogbook = response.data.find((lb) => lb.id === savedDefaultLogbookId)
        if (defaultLogbook) {
          setDefaultLogbook(defaultLogbook)
          if (!selectedLogbook) {
            setSelectedLogbook(defaultLogbook)
          }
        }
      } else if (response.data.length > 0 && !defaultLogbook) {
        // Set first logbook as default if no default is set
        setDefaultLogbook(response.data[0])
        if (!selectedLogbook) {
          setSelectedLogbook(response.data[0])
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch logbooks")
    } finally {
      setLoading(false)
    }
  }

  const updateSelectedLogbook = (logbook: Logbook | null) => {
    setSelectedLogbook(logbook)
    if (logbook) {
      localStorage.setItem("selectedLogbookId", logbook.id)
    } else {
      localStorage.removeItem("selectedLogbookId")
    }
  }

  const updateDefaultLogbook = (logbook: Logbook | null) => {
    setDefaultLogbook(logbook)
    if (logbook) {
      localStorage.setItem("defaultLogbookId", logbook.id)
    } else {
      localStorage.removeItem("defaultLogbookId")
    }
  }

  useEffect(() => {
    // Restore selected logbook from localStorage
    const savedSelectedLogbookId = localStorage.getItem("selectedLogbookId")
    if (savedSelectedLogbookId && logbooks.length > 0) {
      const selectedLogbook = logbooks.find((lb) => lb.id === savedSelectedLogbookId)
      if (selectedLogbook) {
        setSelectedLogbook(selectedLogbook)
      }
    }
  }, [logbooks])

  const value: LogbookContextType = {
    selectedLogbook,
    setSelectedLogbook: updateSelectedLogbook,
    defaultLogbook,
    setDefaultLogbook: updateDefaultLogbook,
    logbooks,
    setLogbooks,
    loading,
    error,
    fetchLogbooks
  }

  return <LogbookContext.Provider value={value}>{children}</LogbookContext.Provider>
}
