#!/bin/sh

# Navigate to app directory
cd /app

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
node server.js
