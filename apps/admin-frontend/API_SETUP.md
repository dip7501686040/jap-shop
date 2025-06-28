# API Configuration Guide

This guide explains how to use the API configuration setup in the admin frontend application.

## Overview

The API configuration provides:
- Centralized axios instance with interceptors
- Automatic token management
- Request/response logging
- Error handling
- Type-safe API services
- Custom hooks for API calls

## Files Structure

```
src/
├── lib/
│   ├── api.ts              # Main axios configuration
│   ├── api-services.ts     # Service classes for different endpoints
│   └── config.ts          # Environment and API configuration
├── hooks/
│   └── useApi.ts          # Custom hooks for API calls
└── examples/
    └── api-usage.tsx      # Usage examples
```

## Setup

### 1. Environment Variables

Create environment files with the API URL:

```bash
# .env.dev
APP_ENV=dev
NEXT_PUBLIC_API_URL=https://janakalyanayurved.shop/api

# .env.staging
APP_ENV=staging
NEXT_PUBLIC_API_URL=https://janakalyanayurved.shop/api

# .env.prd
APP_ENV=prd
NEXT_PUBLIC_API_URL=https://janakalyanayurved.shop/api
```

### 2. Install Dependencies

```bash
pnpm install axios
```

## Usage

### 1. Using API Services

```typescript
import { AuthService, UserService } from '@/lib/api-services'

// Login
const loginResponse = await AuthService.login({
  email: 'user@example.com',
  password: 'password123'
})

// Get users
const usersResponse = await UserService.getUsers(1, 10)
```

### 2. Using Custom Hooks

```typescript
import { useQuery, useMutation } from '@/hooks/useApi'
import { UserService } from '@/lib/api-services'

// For GET requests (queries)
function UsersList() {
  const { data, loading, error, refetch } = useQuery(
    'users',
    () => UserService.getUsers(),
    { executeOnMount: true }
  )

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {data?.data.users.map(user => (
        <div key={user.id}>{user.fullName}</div>
      ))}
    </div>
  )
}

// For POST/PUT/DELETE requests (mutations)
function CreateUser() {
  const { mutate: createUser, loading, error } = useMutation(
    AuthService.signup,
    {
      onSuccess: (data) => console.log('User created:', data),
      onError: (error) => console.error('Failed:', error)
    }
  )

  const handleSubmit = (formData) => {
    createUser(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create User'}
      </button>
    </form>
  )
}
```

### 3. Direct API Client Usage

```typescript
import { apiClient } from '@/lib/api'

// GET request
const response = await apiClient.get('/users')

// POST request
const response = await apiClient.post('/users', userData)

// File upload
const formData = new FormData()
formData.append('file', file)
const response = await apiClient.upload('/upload', formData, (progress) => {
  console.log('Upload progress:', progress)
})
```

## Features

### 1. Automatic Token Management

The API client automatically:
- Adds Authorization header with stored token
- Refreshes expired tokens
- Redirects to login on authentication failure

### 2. Request/Response Interceptors

- **Request Interceptor**: Adds auth headers, logs requests in development
- **Response Interceptor**: Handles token refresh, logs responses, manages errors

### 3. Error Handling

```typescript
// Automatic error handling in hooks
const { data, error } = useQuery('users', UserService.getUsers)

if (error) {
  // error.status - HTTP status code
  // error.message - Error message
  // error.details - Additional error details
}

// Manual error handling
try {
  await AuthService.login(credentials)
} catch (error) {
  const apiError = handleApiError(error)
  console.log(apiError.message)
}
```

### 4. Type Safety

All API services use TypeScript interfaces:

```typescript
interface User {
  id: string
  email: string
  fullName: string
  role: string
  createdAt: string
  updatedAt: string
}

interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}
```

### 5. Environment Configuration

```typescript
import { apiConfig, appConfig } from '@/lib/config'

console.log(apiConfig.baseURL) // API base URL from env
console.log(appConfig.isDevelopment) // Environment check
```

## Best Practices

### 1. Use Service Classes

Instead of raw API calls, use service classes:

```typescript
// ❌ Don't do this
const response = await apiClient.get('/auth/me')

// ✅ Do this
const response = await AuthService.getCurrentUser()
```

### 2. Use Hooks for Components

For React components, use the custom hooks:

```typescript
// ❌ Don't do this in components
useEffect(() => {
  UserService.getUsers().then(setUsers)
}, [])

// ✅ Do this
const { data: users } = useQuery('users', UserService.getUsers)
```

### 3. Handle Loading States

Always handle loading and error states:

```typescript
const { data, loading, error } = useQuery('users', UserService.getUsers)

if (loading) return <Spinner />
if (error) return <ErrorMessage error={error} />
if (!data) return <NoData />

return <UserList users={data.data.users} />
```

### 4. Environment-Specific Configuration

Use different configurations for different environments:

```typescript
// config.ts
export const apiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: process.env.NODE_ENV === 'development' ? 30000 : 10000,
}
```

## Error Handling Patterns

### 1. Global Error Handling

The response interceptor handles common errors:

- **401 Unauthorized**: Attempts token refresh, redirects to login if failed
- **403 Forbidden**: Logs access denied message
- **Network errors**: Shows network error message

### 2. Component-Level Error Handling

```typescript
const { execute, error } = useApi(UserService.deleteUser, {
  onError: (error) => {
    if (error.status === 403) {
      toast.error('You do not have permission to delete this user')
    } else {
      toast.error('Failed to delete user')
    }
  }
})
```

### 3. Form Error Handling

```typescript
const [formErrors, setFormErrors] = useState({})

const { mutate, error } = useMutation(AuthService.signup, {
  onError: (error) => {
    if (error.status === 422 && error.details?.fieldErrors) {
      setFormErrors(error.details.fieldErrors)
    }
  }
})
```

## Debugging

### Development Logging

In development mode, all requests and responses are logged to the console:

```
🚀 Request: GET /users
✅ Response: 200 /users (1.2s)
```

### Error Logging

API errors are automatically logged with full context:

```
❌ Response Error: {
  status: 404,
  url: '/users/123',
  message: 'User not found'
}
```

## Migration from Mock Data

To migrate from mock data to real API:

1. Replace mock functions in auth context
2. Update API service endpoints
3. Ensure proper error handling
4. Update type definitions if needed

The current setup is ready for real API integration - just update the service implementations!
