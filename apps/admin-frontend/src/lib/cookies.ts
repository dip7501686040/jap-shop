import Cookies from "js-cookie"

// Cookie configuration
const cookieConfig = {
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const
}

// Token management utilities
export const tokenStorage = {
  // Set access token (short-lived)
  setAccessToken: (token: string) => {
    Cookies.set("accessToken", token, {
      ...cookieConfig,
      expires: 1 // 1 day
    })
  },

  // Set refresh token (long-lived)
  setRefreshToken: (token: string) => {
    Cookies.set("refreshToken", token, {
      ...cookieConfig,
      expires: 7 // 7 days
    })
  },

  // Get access token
  getAccessToken: (): string | undefined => {
    return Cookies.get("accessToken")
  },

  // Get refresh token
  getRefreshToken: (): string | undefined => {
    return Cookies.get("refreshToken")
  },

  // Remove all tokens
  clearTokens: () => {
    Cookies.remove("accessToken")
    Cookies.remove("refreshToken")
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!Cookies.get("accessToken")
  }
}

// General cookie utilities
export const cookieUtils = {
  // Set a cookie with default config
  set: (name: string, value: string, days: number = 1) => {
    Cookies.set(name, value, {
      ...cookieConfig,
      expires: days
    })
  },

  // Get a cookie
  get: (name: string): string | undefined => {
    return Cookies.get(name)
  },

  // Remove a cookie
  remove: (name: string) => {
    Cookies.remove(name)
  },

  // Check if a cookie exists
  exists: (name: string): boolean => {
    return !!Cookies.get(name)
  }
}
