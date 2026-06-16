#!/bin/bash
# Custom dev script for Pendek.in
# This is executed by /start.sh during container boot

set -e
cd /home/z/my-project

echo "[DEV] Writing .env with all required variables..."
cat > .env << 'ENVEOF'
DATABASE_URL=file:/home/z/my-project/db/custom.db
NEXTAUTH_SECRET=pendek-in-secret-key-change-in-production-2024
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
ENVEOF

echo "[DEV] Installing dependencies..."
bun install

echo "[DEV] Setting up database..."
bun run db:push

echo "[DEV] Starting Next.js dev server..."
setsid bash -c 'exec bun run dev' </dev/null > /home/z/my-project/dev.log 2>&1 &
echo "[DEV] Dev server started (PID: $!)"

# Wait for server to be ready
echo "[DEV] Waiting for Next.js to be ready on port 3000..."
for i in $(seq 1 30); do
  if curl -s --connect-timeout 2 --max-time 3 "http://localhost:3000" > /dev/null 2>&1; then
    echo "[DEV] Next.js is ready!"
    exit 0
  fi
  echo "[DEV] Attempt $i/30: not ready yet..."
  sleep 2
done

echo "[DEV] WARNING: Next.js failed to start within 60s, but continuing..."
exit 0