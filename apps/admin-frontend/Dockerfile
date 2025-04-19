FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install only production dependencies
COPY package.json ./

# Install pnpm globally
RUN npm install -g pnpm

# Install only this app's dependencies without lock file
RUN pnpm install

# Copy the app's source code
COPY . .

# Build the app for development
RUN pnpm run build:dev

# Expose your app port
EXPOSE 3000

# Run the app
CMD ["pnpm", "run", "start:dev"]