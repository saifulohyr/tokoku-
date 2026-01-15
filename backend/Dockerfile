# Single stage build for reliability
FROM node:20-alpine

WORKDIR /app

# Upgrade npm to latest to avoid bugs
RUN npm install -g npm@latest

# Install Nest CLI globally to ensure 'nest' command exists
RUN npm install -g @nestjs/cli

# Copy package files
COPY package*.json ./

# Install ALL dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
# Use specific path if global doesn't work, but global should work now
RUN npm run build

# Verify build output - CRITICAL STEP
# If this fails, build failed.
RUN ls -la dist/

# Expose port
EXPOSE 3001

# Set environment to production
ENV NODE_ENV=production

# Start the application with shell to debug if main.js missing again
CMD ["sh", "-c", "ls -la dist/ && node dist/main.js"]
