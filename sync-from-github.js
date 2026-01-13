#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO_DIR = __dirname;
const LOG_FILE = path.join(__dirname, 'sync.log');

function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(logMessage.trim());
    
    try {
        fs.appendFileSync(LOG_FILE, logMessage);
    } catch (err) {
        console.error('Failed to write to log file:', err.message);
    }
}

async function syncFromGitHub() {
    try {
        log('Starting GitHub sync...');
        
        // Change to repo directory
        process.chdir(REPO_DIR);
        
        log('Fetching latest changes from GitHub...');
        execSync('git fetch origin', { stdio: 'inherit' });
        
        const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
        
        const status = execSync('git status -sb', { encoding: 'utf-8' });
        
        if (status.includes('behind')) {
            log(`Updates found. Pulling changes from origin/${currentBranch}...`);
            execSync(`git pull origin ${currentBranch}`, { stdio: 'inherit' });
            log('Successfully synced from GitHub');
        } else {
            log('Already up to date. No changes to pull.');
        }
        
        log('GitHub sync completed successfully');
    } catch (error) {
        log(`Error during GitHub sync: ${error.message}`);
        process.exit(1);
    }
}

syncFromGitHub();
