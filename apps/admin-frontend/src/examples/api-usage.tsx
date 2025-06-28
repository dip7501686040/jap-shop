// Example usage of API services and hooks

import { useApi, useMutation, useQuery } from "@/hooks/useApi"
import { AuthService, UserService, DashboardService } from "@/lib/api-services"

// Example 1: Using the useQuery hook for fetching data
export function UsersList() {
  const {
    data: usersData,
    loading,
    error,
    refetch
  } = useQuery("users-list", () => UserService.getUsers(1, 10), {
    executeOnMount: true,
    refetchInterval: 30000 // Refetch every 30 seconds
  })

  if (loading) return <div>Loading users...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!usersData) return <div>No data</div>

  return (
    <div>
      <button onClick={refetch}>Refresh Users</button>
      <ul>
        {usersData.data.users.map((user) => (
          <li key={user.id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  )
}

// Example 2: Using the useMutation hook for create/update operations
export function CreateUserForm() {
  const {
    mutate: createUser,
    loading,
    error,
    data
  } = useMutation((userData: { name: string; email: string; password: string }) => AuthService.signup(userData), {
    onSuccess: (data) => {
      console.log("User created successfully:", data)
      // Handle success (e.g., redirect, show message)
    },
    onError: (error) => {
      console.error("Failed to create user:", error)
      // Handle error (e.g., show error message)
    }
  })

  const handleSubmit = (formData: { name: string; email: string; password: string }) => {
    createUser(formData)
  }

  return (
    <div>
      {/* Your form JSX here */}
      <button onClick={() => handleSubmit({ name: "Test", email: "test@example.com", password: "password123" })} disabled={loading}>
        {loading ? "Creating..." : "Create User"}
      </button>
      {error && <div>Error: {error.message}</div>}
      {data && <div>Success: User created!</div>}
    </div>
  )
}

// Example 3: Using the useApi hook for custom API calls
export function DashboardStats() {
  const {
    data: stats,
    loading,
    error,
    execute: fetchStats
  } = useApi(DashboardService.getStats, {
    executeOnMount: true,
    onSuccess: (data) => {
      console.log("Stats loaded:", data)
    },
    onError: (error) => {
      console.error("Failed to load stats:", error)
    }
  })

  return (
    <div>
      <button onClick={fetchStats} disabled={loading}>
        {loading ? "Loading..." : "Refresh Stats"}
      </button>
      {error && <div>Error: {error.message}</div>}
      {stats && (
        <div>
          <h3>Dashboard Stats</h3>
          <pre>{JSON.stringify(stats.data, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

// Example 4: Direct API service usage (without hooks)
export async function directApiExample() {
  try {
    // Login user
    const loginResponse = await AuthService.login({
      email: "user@example.com",
      password: "password123"
    })

    if (loginResponse.success) {
      console.log("Login successful:", loginResponse.data)

      // Fetch user data
      const userResponse = await AuthService.getCurrentUser()
      if (userResponse.success) {
        console.log("Current user:", userResponse.data)
      }
    }
  } catch (error) {
    console.error("API Error:", error)
  }
}

// Example 5: File upload with progress
export function FileUpload() {
  const {
    mutate: uploadFile,
    loading,
    error
  } = useMutation(({ file }: { file: File; onProgress?: (progress: number) => void }) => {
    const formData = new FormData()
    formData.append("file", file)

    return fetch("/api/upload", {
      method: "POST",
      body: formData
      // You can add progress tracking here if needed
    }).then((res) => res.json())
  })

  const handleFileUpload = (file: File) => {
    uploadFile({
      file
    })
  }

  return (
    <div>
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileUpload(file)
        }}
        disabled={loading}
      />
      {loading && <div>Uploading...</div>}
      {error && <div>Upload failed: {error.message}</div>}
    </div>
  )
}

// Example 6: Error handling patterns
export function ErrorHandlingExample() {
  const { execute, loading, error } = useApi(
    async (userId: unknown) => {
      const response = await UserService.getUserById(userId as string)
      return response.data
    },
    {
      onError: (error) => {
        // Custom error handling
        switch (error.status) {
          case 404:
            console.log("User not found")
            break
          case 403:
            console.log("Access denied")
            break
          case 500:
            console.log("Server error")
            break
          default:
            console.log("Unknown error:", error.message)
        }
      }
    }
  )

  return (
    <div>
      <button onClick={() => execute("user-123")}>Load User</button>
      {loading && <div>Loading...</div>}
      {error && (
        <div className="error">
          <h4>Error occurred:</h4>
          <p>Status: {error.status}</p>
          <p>Message: {error.message}</p>
          {error.details ? <pre>{typeof error.details === "object" ? JSON.stringify(error.details, null, 2) : String(error.details)}</pre> : null}
        </div>
      )}
    </div>
  )
}
