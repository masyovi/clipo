#!/usr/bin/env bash
# Keepalive daemon for Next.js dev server
cd /home/z/my-project

while true; do
  # Check if port 3000 is in use
  if ! lsof -i :3000 -sTCP:LISTEN > /dev/null 2>&1; then
    echo "[$(date)] Starting dev server..." >> /home/z/my-project/server-keepalive.log
    nohup npx next dev -p 3000 >> /home/z/my-project/dev.log 2>&1 &
    NEW_PID=$!
    echo "[$(date)] Started with PID $NEW_PID" >> /home/z/my-project/server-keepalive.log
    disown $NEW_PID 2>/dev/null
  fi
  sleep 3
done