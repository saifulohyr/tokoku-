# Single stage build for reliability (Emergency fix)
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Verify build output (Debug)
RUN ls -la dist/

# Expose port
EXPOSE 3001

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/main.js"]
