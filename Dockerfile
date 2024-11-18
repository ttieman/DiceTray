# Build stage
FROM node:18-alpine as build

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Build the application (for production)
RUN npm run build

# Production stage
FROM nginx:alpine as production

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from build stage
COPY --from=build /usr/src/app/app/dist /usr/share/nginx/html

# Configure nginx for WASM and CORS
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        try_files $uri $uri/ /index.html; \
        add_header Cross-Origin-Opener-Policy same-origin always; \
        add_header Cross-Origin-Embedder-Policy require-corp always; \
    } \
    types { \
        application/wasm wasm; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]