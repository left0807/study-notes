#!/bin/bash

# Script to set up daily GitHub sync via cron

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CRON_JOB="0 2 * * * cd $SCRIPT_DIR && /usr/bin/node $SCRIPT_DIR/sync-from-github.js >> $SCRIPT_DIR/logs/cron.log 2>&1"

if crontab -l 2>/dev/null | grep -q "sync-from-github.js"; then
    echo "Cron job already exists. Removing old entry..."
    crontab -l 2>/dev/null | grep -v "sync-from-github.js" | crontab -
fi

# Add new cron job
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

echo "Cron job added successfully!"
echo "The sync will run daily at 2:00 AM"
echo ""
echo "Current crontab:"
crontab -l
