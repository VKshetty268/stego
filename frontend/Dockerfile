# --- Build stage ---
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# VITE_API_URL is injected at build time by docker-compose
RUN npm run build  # outputs to /app/dist

# --- Nginx stage ---
FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

# SPA history fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built site
COPY --from=builder /app/dist ./

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
