# Frontend Dockerfile (React build + Nginx static serve)

## Build stage
FROM docker.m.daocloud.io/library/node:20-alpine AS build
WORKDIR /app
COPY frontend/package.json /app/package.json
# If you later add a lock file, copy it too for reproducible builds.
# COPY frontend/package-lock.json /app/package-lock.json
RUN npm install --no-audit --no-fund
COPY frontend/ /app/
RUN npm run build

## Runtime stage
FROM nginx:alpine AS runtime

# Copy build output
COPY --from=build /app/dist/ /usr/share/nginx/html/

# Nginx template and entrypoint for API proxy
COPY frontend/nginx.conf.template /etc/nginx/templates/nginx.conf.template
COPY frontend/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Use 3000 (avoid 8080)
EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint.sh"]

