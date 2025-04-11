FROM node:latest
# Create app directory
WORKDIR /app
# Install app dependencies
COPY . .
# Expose the port the app runs on
EXPOSE 4001
CMD ["pnpm", "run", "start:dev"]