import { config as loadEnv } from "dotenv"
import { NextConfig } from "next"

// Determine the environment (default to "dev")
const APP_ENV = process.env.APP_ENV || "dev"

// Load the correct `.env` file
loadEnv({ path: `.env.${APP_ENV}` })

const nextConfig: NextConfig = {
  env: {
    APP_ENV: process.env.APP_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
    // Add any other variables you want to expose to the frontend
  }
}

export default nextConfig
