# --- Build stage ---
FROM node:20-alpine AS builder
WORKDIR /app

# Faster, cache-friendly installs
COPY package*.json ./
RUN npm ci

# Copy the rest and build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build  # expects to emit to /app/dist

# --- Runtime stage ---
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Only runtime deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# If you serve any static or templates at runtime, copy them here too
# COPY public ./public

EXPOSE 4000
CMD ["node", "dist/server.js"]
