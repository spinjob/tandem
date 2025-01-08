# Use Node 16 as base image for better compatibility
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps to handle React version conflicts
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose the port your Next.js app runs on (typically 3000)
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev"] 