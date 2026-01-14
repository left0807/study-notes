let currentPath = '';
let sidebarCollapsed = false;

async function loadDirectory(path = '') {
    try {
        const response = await fetch(`/api/list?path=${encodeURIComponent(path)}`);
        const items = await response.json();
        
        if (response.ok) {
            currentPath = path;
            renderBreadcrumb(path);
            renderFileList(items);
        } else {
            console.error('Error loading directory:', items.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function renderBreadcrumb(path) {
    const breadcrumb = document.getElementById('breadcrumb');
    const parts = path.split('/').filter(p => p);
    
    let html = '<a href="#" onclick="loadDirectory(\'\'); return false;">Home</a>';
    
    let current = '';
    parts.forEach(part => {
        current += (current ? '/' : '') + part;
        html += ' / <a href="#" onclick="loadDirectory(\'' + current + '\'); return false;">' + part + '</a>';
    });
    
    breadcrumb.innerHTML = html;
}

function renderFileList(items) {
    const fileList = document.getElementById('file-list');
    
    if (items.length === 0) {
        fileList.innerHTML = '<div class="empty-state">No files found</div>';
        return;
    }
    
    fileList.innerHTML = items.map(item => {
        const className = `file-item ${item.type}`;
        return `<div class="${className}" onclick="handleItemClick('${item.type}', '${item.path}', this)">${item.name}</div>`;
    }).join('');
}

function handleItemClick(type, path, element) {
    if (type === 'directory') {
        loadDirectory(path);
        document.getElementById('markdown-content').innerHTML = '';
    } else if (type === 'file') {
        loadFile(path);
        // Update active state
        document.querySelectorAll('.file-item').forEach(item => {
            item.classList.remove('active');
        });
        element.classList.add('active');
    }
}

async function loadFile(path) {
    try {
        const response = await fetch(`/api/file?path=${encodeURIComponent(path)}`);
        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('markdown-content').innerHTML = data.html;
            // Scroll to top
            document.querySelector('.content').scrollTop = 0;
        } else {
            document.getElementById('markdown-content').innerHTML = 
                `<div class="empty-state">Error loading file: ${data.error}</div>`;
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('markdown-content').innerHTML = 
            `<div class="empty-state">Error loading file</div>`;
    }
}

function setupSidebarToggle() {
    const toggleButton = document.getElementById('toggle-sidebar');
    const container = document.querySelector('.container');

    if (!toggleButton || !container) return;

    toggleButton.addEventListener('click', () => {
        sidebarCollapsed = !sidebarCollapsed;
        if (sidebarCollapsed) {
            container.classList.add('sidebar-collapsed');
        } else {
            container.classList.remove('sidebar-collapsed');
        }
    });
}

// Initialize
loadDirectory();
setupSidebarToggle();