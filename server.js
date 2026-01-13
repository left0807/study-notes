const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const MarkdownIt = require('markdown-it');

const app = express();
const md = new MarkdownIt();
const PORT = 5000;
const NOTES_DIR = __dirname + '/notes';

// Serve static files from public directory
app.use(express.static('public'));

// API endpoint to list directory contents
app.get('/api/list', async (req, res) => {
  try {
    const dirPath = req.query.path || '';
    const fullPath = path.join(NOTES_DIR, dirPath);
    
    // Security check: ensure path is within NOTES_DIR
    const resolvedPath = path.resolve(fullPath);
    const resolvedNotesDir = path.resolve(NOTES_DIR);
    
    if (!resolvedPath.startsWith(resolvedNotesDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const items = await fs.readdir(fullPath, { withFileTypes: true });
    const result = [];

    for (const item of items) {
      // Skip hidden files and node_modules
      if (item.name.startsWith('.') || item.name === 'node_modules' || item.name === 'public') {
        continue;
      }

      const itemPath = path.join(fullPath, item.name);
      const relativePath = path.join(dirPath, item.name).replace(/\\/g, '/');
      
      if (item.isDirectory()) {
        result.push({
          name: item.name,
          type: 'directory',
          path: relativePath
        });
      } else if (item.name.endsWith('.md')) {
        result.push({
          name: item.name,
          type: 'file',
          path: relativePath
        });
      }
    }

    // Sort: directories first, then files, both alphabetically
    result.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to get markdown file content
app.get('/api/file', async (req, res) => {
  try {
    const filePath = req.query.path || '';
    const fullPath = path.join(NOTES_DIR, filePath);
    
    // Security check
    const resolvedPath = path.resolve(fullPath);
    const resolvedNotesDir = path.resolve(NOTES_DIR);
    
    if (!resolvedPath.startsWith(resolvedNotesDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const content = await fs.readFile(fullPath, 'utf-8');
    const html = md.render(content);
    
    res.json({ html, path: filePath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
