#!/bin/sh

# Navigate to app directory
cd /app

# Check if database exists
if [ ! -f /data/production.db ]; then
  echo "Database doesn't exist. Creating and seeding..."
  npx prisma migrate deploy
  npx prisma db seed --skip-generate
else
  echo "Database exists. Running migrations..."
  npx prisma migrate deploy
fi

# Start the application
node server.js