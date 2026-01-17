#!/bin/bash

# Deployment script for 24/7 operation

set -e

echo "Deploying Study Notes Website..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Create logs directory
echo "Creating logs directory..."
mkdir -p logs

# Start with PM2
echo "Starting application with PM2..."
npm run pm2:start

# Setup PM2 startup on boot
echo "Setting up PM2 startup on boot..."
pm2 startup || echo "Note: Run 'pm2 startup' and 'pm2 save' manually if needed"

# Setup cron job for daily sync
echo "Setting up daily GitHub sync..."
./setup-cron.sh

echo ""
echo "Deployment complete!"
echo ""
echo "Application status:"
npm run pm2:status
echo ""
echo "To view logs: npm run pm2:logs"
echo "To restart: npm run pm2:restart"
