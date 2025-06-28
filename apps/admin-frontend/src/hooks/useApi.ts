import { useState, useEffect, useCallback } from "react"
import { AxiosError } from "axios"

// Types for the hook
export interface UseApiOptions<T> {
  initialData?: T
  executeOnMount?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: ApiError) => void
}

export interface ApiError {
  message: string
  status?: number
  code?: string
  details?: any
}

export interface UseApiResult<T> {
  data: T | null
  loading: boolean
  error: ApiError | null
  execute: (...args: any[]) => Promise<T | null>
  reset: () => void
}

// Custom hook for API calls
export function useApi<T = any>(apiFunction: (...args: any[]) => Promise<T>, options: UseApiOptions<T> = {}): UseApiResult<T> {
  const { initialData = null, executeOnMount = false, onSuccess, onError } = options

  const [data, setData] = useState<T | null>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      try {
        setLoading(true)
        setError(null)

        const result = await apiFunction(...args)
        setData(result)

        if (onSuccess) {
          onSuccess(result)
        }

        return result
      } catch (err) {
        const apiError = handleApiError(err)
        setError(apiError)

        if (onError) {
          onError(apiError)
        }

        return null
      } finally {
        setLoading(false)
      }
    },
    [apiFunction, onSuccess, onError]
  )

  const reset = useCallback(() => {
    setData(initialData)
    setError(null)
    setLoading(false)
  }, [initialData])

  useEffect(() => {
    if (executeOnMount) {
      execute()
    }
  }, [executeOnMount, execute])

  return {
    data,
    loading,
    error,
    execute,
    reset
  }
}

// Helper function to handle API errors
export function handleApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const response = error.response
    const request = error.request

    if (response) {
      // Server responded with error status
      return {
        message: response.data?.message || response.data?.error || "Server error occurred",
        status: response.status,
        code: response.data?.code,
        details: response.data
      }
    } else if (request) {
      // Request was made but no response received
      return {
        message: "Network error - no response from server",
        code: "NETWORK_ERROR"
      }
    } else {
      // Request setup error
      return {
        message: error.message || "Request configuration error",
        code: "REQUEST_ERROR"
      }
    }
  }

  // Generic error
  return {
    message: error instanceof Error ? error.message : "An unexpected error occurred",
    code: "UNKNOWN_ERROR"
  }
}

// Hook for mutations (POST, PUT, DELETE operations)
export function useMutation<TData = any, TVariables = any>(mutationFn: (variables: TVariables) => Promise<TData>, options: UseApiOptions<TData> = {}) {
  const [data, setData] = useState<TData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData | null> => {
      try {
        setLoading(true)
        setError(null)

        const result = await mutationFn(variables)
        setData(result)

        if (options.onSuccess) {
          options.onSuccess(result)
        }

        return result
      } catch (err) {
        const apiError = handleApiError(err)
        setError(apiError)

        if (options.onError) {
          options.onError(apiError)
        }

        return null
      } finally {
        setLoading(false)
      }
    },
    [mutationFn, options]
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    data,
    loading,
    error,
    mutate,
    reset
  }
}

// Hook for queries (GET operations)
export function useQuery<T = any>(
  queryKey: string,
  queryFn: () => Promise<T>,
  options: UseApiOptions<T> & {
    enabled?: boolean
    refetchInterval?: number
  } = {}
) {
  const { enabled = true, refetchInterval, executeOnMount = true, ...restOptions } = options

  const result = useApi(queryFn, {
    ...restOptions,
    executeOnMount: executeOnMount && enabled
  })

  // Auto refetch
  useEffect(() => {
    if (refetchInterval && enabled && !result.loading) {
      const interval = setInterval(() => {
        result.execute()
      }, refetchInterval)

      return () => clearInterval(interval)
    }
  }, [refetchInterval, enabled, result.loading, result.execute])

  return {
    ...result,
    refetch: result.execute
  }
}
