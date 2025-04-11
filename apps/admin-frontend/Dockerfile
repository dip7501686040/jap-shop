FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy prebuilt files from the workspace (assumes CI has built them)
COPY . .

# Install pnpm globally
RUN npm install -g pnpm

# Expose your app port
EXPOSE 3000

# Run the app directly (dev or prod)
CMD ["pnpm", "run", "start:dev"]