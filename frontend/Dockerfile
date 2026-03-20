# --- Build Stage ---
FROM node:20-alpine AS build

# Working directory
WORKDIR /app

# Install dependencies (using legacy-peer-deps for react-simple-maps)
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# Copy app source and build
COPY . .
RUN npm run build

# --- Production Stage ---
FROM nginx:stable-alpine

# Copy built assets to Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx config for React routing if needed
# (Assuming simple hash or default Nginx is OK, otherwise add config)

# Expose Nginx port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
