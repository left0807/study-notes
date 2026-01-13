# Study Notes Website

A simple web application to navigate and display study notes stored in Markdown format.

## Features

- Navigate through directories
- Display markdown files with syntax highlighting
- Dark theme with coding font style
- Simple and clean interface
- 24/7 operation with PM2 process manager
- Daily automatic sync from GitHub

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server (development):
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:5000
```

## Production Deployment (24/7 Operation)

### Initial Setup

1. Install PM2 globally (if not already installed):
```bash
npm install -g pm2
```

2. Install project dependencies:
```bash
npm install
```

3. Start the application with PM2:
```bash
npm run pm2:start
```

4. Set PM2 to start on system boot:
```bash
pm2 startup
pm2 save
```

### Daily GitHub Sync Setup

The application can automatically sync notes from GitHub daily. To set this up:

1. Make sure your repository is connected to GitHub:
```bash
git remote -v
```

2. Run the cron setup script:
```bash
./setup-cron.sh
```

This will configure a daily sync at 2:00 AM. You can manually test the sync with:
```bash
npm run sync
```

### PM2 Management Commands

- View status: `npm run pm2:status`
- View logs: `npm run pm2:logs`
- Restart: `npm run pm2:restart`
- Stop: `npm run pm2:stop`
- Delete: `npm run pm2:delete`

### Manual Sync

To manually sync from GitHub:
```bash
npm run sync
```

## Usage

- Click on directories to navigate
- Click on markdown files to view their content
- Use the breadcrumb navigation to go back to parent directories

## Logs

- Application logs: `logs/out.log` and `logs/error.log`
- Sync logs: `sync.log` and `logs/cron.log`
