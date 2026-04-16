# High-Reliability "Force-Build" Dockerfile for Next.js 15
FROM node:20

WORKDIR /app

# Ensure we have the correct build environment
RUN apt-get update && apt-get install -y \
    libc6 \
    && rm -rf /var/lib/apt/lists/*

# Copy package manifests
COPY package.json package-lock.json* ./

# Install dependencies - using simple install for reliability
RUN npm install

# Copy the rest of the application
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Ensure the public directory exists (prevents build-time crashes)
RUN mkdir -p public

# Execute the build
RUN npm run build

# Expose the Cloud Run port
EXPOSE 8080
ENV PORT 8080
ENV HOSTNAME "0.0.0.0"

# Standard start command for the "Fat" container
CMD ["npm", "start"]
