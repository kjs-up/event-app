FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install system dependencies (as root)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Copy package files (for caching dependencies)
COPY package*.json ./

# Install all dependencies (production + development)
# This is required for 'npm run build' and 'npm run dev' later.
RUN npm ci

# Copy all source code
COPY . .

# Build the application *while still root* to ensure permissions for /app/dist are correct.
# This assumes the build command creates the /app/dist directory.
RUN npm run build

# Ensure the entire /app directory is owned by the 'node' user 
# before switching users. This is cleaner than your previous steps.
RUN chown -R node:node /app

# Switch to non-root user for security
USER node

# Expose ports for the app and for debugging
EXPOSE 3000 9229

# Health check (Using 'npm run start' or similar is usually better than 'node --version')
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node --version || exit 1

# Default command for development
# This command runs your application in development/watch mode.
CMD ["npm", "run", "dev"]