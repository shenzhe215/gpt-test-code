#!/bin/sh
set -eu

# Default backend URL can be overridden at runtime via -e BACKEND_URL=...
BACKEND_URL_DEFAULT="http://backend:8000"
BACKEND_URL="${BACKEND_URL:-$BACKEND_URL_DEFAULT}"

echo "Using BACKEND_URL=$BACKEND_URL"

# Render nginx config from template
env BACKEND_URL="$BACKEND_URL" \
  sh -c "envsubst '\$BACKEND_URL' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/conf.d/default.conf"

exec nginx -g 'daemon off;'

