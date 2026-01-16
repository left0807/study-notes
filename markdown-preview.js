const express = require('express');
const fs = require('fs');
const marked = require('marked');
const hljs = require('highlight.js'); // Require highlight.js

const app = express();
const port = 5123;

// --- Configuration ---
const markdownFileArgIndex = 2; // process.argv[2] is the first argument after the script name
const stylesPath = './public/style.css'; // Path to project's CSS

// --- Argument Validation ---
if (process.argv.length <= markdownFileArgIndex) {
  console.error('Error: Please provide the path to a markdown file as an argument.');
  console.error('Example: node markdown-preview.js ./notes/some_note.md');
  process.exit(1);
}
const markdownFilePath = process.argv[markdownFileArgIndex];

// --- Read Project Styles ---
let cssContent;
try {
  cssContent = fs.readFileSync(stylesPath, 'utf8');
} catch (error) {
  console.error(`Error reading styles file "${stylesPath}": ${error.message}`);
  console.error('Please ensure the file exists and is readable.');
  process.exit(1);
}

// --- Read and Process Markdown ---
let markdownContent;
try {
  markdownContent = fs.readFileSync(markdownFilePath, 'utf8');
} catch (error) {
  console.error(`Error reading markdown file "${markdownFilePath}": ${error.message}`);
  process.exit(1);
}

// Configure marked to use highlight.js for code blocks
marked.setOptions({
  highlight: function(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language: language }).value;
  }
});

// Convert markdown to HTML
const renderedMarkdownHtml = marked.parse(markdownContent);

// --- Construct Full HTML Page ---
// Wrap the rendered markdown in a div with id="markdown-content" to ensure the styles
// from ./public/style.css that target this ID are correctly applied to the markdown content.
// Also includes CDN links for highlight.js and KaTeX.
const htmlPage = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Preview: ${markdownFilePath}</title>
  <style>
    ${cssContent}
  </style>
  <!-- CDN for Highlight.js -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/atom-one-dark.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/highlight.min.js"></script>
  <!-- CDN for KaTeX -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
</head>
<body>
  <div id="markdown-content">
    ${renderedMarkdownHtml}
  </div>
  <script>
    // Initialize Highlight.js
    document.addEventListener('DOMContentLoaded', (event) => {
      document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block);
      });
    });

    // KaTeX rendering is not automatically handled by marked.parse without extensions.
    // If you need KaTeX for math rendering, you might need to configure marked further
    // or use a library like 'marked-katex-extension'. For now, we've included the CDN.
  </script>
</body>
</html>
`;

// --- Setup Server Route ---
// The root route '/' will serve the generated HTML page.
app.get('/', (req, res) => {
  res.send(htmlPage);
});

// --- Start Server ---
app.listen(port, () => {
  console.log(`Markdown preview server started on http://localhost:${port}`);
  console.log(`Serving content from: ${markdownFilePath}`);
  console.log(`Using styles from: ${stylesPath}`);
});
