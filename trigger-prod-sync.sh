#!/bin/bash

echo "Triggering production sync..."
curl -X POST https://ekaty.fly.dev/api/admin/sync-multi-source \
  -H "Authorization: Bearer ekaty-admin-secret-2025" \
  -H "Content-Type: application/json"

echo ""
echo "Sync triggered! The cron job will populate the database."
echo "This may take 10-15 minutes to complete."
