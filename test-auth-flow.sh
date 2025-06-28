#!/bin/bash

echo "=== Testing Authentication Flow ==="
echo

# Test 1: Signup
echo "1. Testing Signup..."
signup_response=$(curl -s -X POST http://localhost:4001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Frontend Test User",
    "email": "frontend@test.com",
    "password": "password123"
  }')

echo "Signup Response: $signup_response"
echo

# Test 2: Login
echo "2. Testing Login..."
login_response=$(curl -s -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "frontend@test.com",
    "password": "password123"
  }')

echo "Login Response: $login_response"
echo

# Extract access token from login response
access_token=$(echo $login_response | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
echo "Extracted Access Token: $access_token"
echo

# Test 3: Get Profile
echo "3. Testing Protected /me endpoint..."
me_response=$(curl -s -X GET http://localhost:4001/api/auth/me \
  -H "Authorization: Bearer $access_token")

echo "Profile Response: $me_response"
echo

# Extract refresh token
refresh_token=$(echo $login_response | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)
echo "Extracted Refresh Token: $refresh_token"
echo

# Test 4: Refresh Token
echo "4. Testing Refresh Token..."
refresh_response=$(curl -s -X POST http://localhost:4001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$refresh_token\"}")

echo "Refresh Response: $refresh_response"
echo

# Test 5: Logout
echo "5. Testing Logout..."
logout_response=$(curl -s -X POST http://localhost:4001/api/auth/logout \
  -H "Authorization: Bearer $access_token")

echo "Logout Response: $logout_response"
echo

echo "=== Authentication Flow Test Complete ==="
