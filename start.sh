#!/bin/sh
set -e  # Exit on any error

echo "Starting eKaty application..."
echo "Current working directory: $(pwd)"
echo "Contents of /app: $(ls -la /app)"

# Navigate to app directory
cd /app

# Verify server.js exists
if [ ! -f "server.js" ]; then
    echo "ERROR: server.js not found in /app"
    echo "Available files: $(ls -la)"
    exit 1
fi

# Check if database exists
if [ ! -f /data/ekaty.db ]; then
  echo "Database doesn't exist. Creating and seeding..."
  npx prisma db push
  npx ts-node --transpile-only prisma/seed-katy.ts || echo "Seeding skipped or failed"
else
  echo "Database exists. Running migrations..."
  npx prisma db push
fi

# Start the application
echo "Starting Next.js server..."
exec node server.js
