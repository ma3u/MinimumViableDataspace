#
#  Copyright (c) 2024 Aerospace DPP Demo
#
#  This program and the accompanying materials are made available under the
#  terms of the Apache License, Version 2.0 which is available at
#  https://www.apache.org/licenses/LICENSE-2.0
#
#  SPDX-License-Identifier: Apache-2.0
#

# Build stage
FROM node:20-alpine AS builder

# Build argument for API mode (default to hybrid for Docker)
ARG VITE_API_MODE=full

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Create .env file for Vite to pick up during build
# Use empty URLs so browser uses relative paths through nginx proxy
RUN echo "VITE_API_MODE=${VITE_API_MODE}" > .env.production && \
    echo "VITE_EHR_BACKEND_URL=" >> .env.production && \
    echo "VITE_MOCK_API_URL=" >> .env.production && \
    echo "VITE_EDC_API_URL=" >> .env.production && \
    echo "VITE_BACKEND_URL=" >> .env.production

RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
