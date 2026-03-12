# Debian bookworm includes glibc 2.36 (>= 2.29)
FROM node:20.19.4-bookworm-slim

WORKDIR /app

# Install python3, python-is-python3, make, and g++ without manual symlinks
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 python-is-python3 make g++ ca-certificates \
 && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
# Use npm ci for clean, reproducible builds
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000
# Start the server
CMD ["npm", "start"]
