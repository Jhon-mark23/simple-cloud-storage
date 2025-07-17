document.addEventListener('DOMContentLoaded', function() {
    const fileList = document.getElementById('file-list');
    const refreshBtn = document.getElementById('refresh-btn');
    
    // Load files on page load
    loadFiles();
    
    // Refresh button click handler
    refreshBtn.addEventListener('click', loadFiles);
    
    // Function to load files from server
    function loadFiles() {
        fileList.innerHTML = '<div class="loading">Loading files...</div>';
        
        fetch('/files')
            .then(response => response.json())
            .then(files => {
                if (files.length === 0) {
                    fileList.innerHTML = '<div class="loading">No files found</div>';
                    return;
                }
                
                fileList.innerHTML = '';
                files.forEach(file => {
                    const fileItem = createFileItem(file);
                    fileList.appendChild(fileItem);
                });
            })
            .catch(error => {
                console.error('Error loading files:', error);
                fileList.innerHTML = '<div class="loading error">Failed to load files</div>';
            });
    }
    
    // Create a file item element
    function createFileItem(filename) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        const fileType = getFileType(filename);
        const fileIcon = document.createElement('div');
        fileIcon.className = 'file-icon';
        fileIcon.innerHTML = getFileIcon(fileType);
        
        const fileName = document.createElement('div');
        fileName.className = 'file-name';
        fileName.textContent = filename;
        
        const fileActions = document.createElement('div');
        fileActions.className = 'file-actions';
        
        const viewBtn = document.createElement('button');
        viewBtn.className = 'view-btn';
        viewBtn.innerHTML = '<i class="fas fa-eye"></i> View';
        viewBtn.addEventListener('click', () => viewFile(filename, fileType));
        
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'download-btn';
        downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download';
        downloadBtn.addEventListener('click', () => downloadFile(filename));
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
        deleteBtn.addEventListener('click', () => deleteFile(filename));
        
        fileActions.appendChild(viewBtn);
        fileActions.appendChild(downloadBtn);
        fileActions.appendChild(deleteBtn);
        
        fileItem.appendChild(fileIcon);
        fileItem.appendChild(fileName);
        fileItem.appendChild(fileActions);
        
        return fileItem;
    }
    
    // Get file type based on extension
    function getFileType(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        const videoTypes = ['mp4', 'webm', 'ogg', 'mov', 'avi'];
        
        if (imageTypes.includes(extension)) return 'image';
        if (videoTypes.includes(extension)) return 'video';
        return 'other';
    }
    
    // Get appropriate icon for file type
    function getFileIcon(fileType) {
        switch(fileType) {
            case 'image': return '<i class="fas fa-image"></i>';
            case 'video': return '<i class="fas fa-video"></i>';
            default: return '<i class="fas fa-file"></i>';
        }
    }
    
    // View file in media viewer
    function viewFile(filename, fileType) {
        if (fileType === 'image' || fileType === 'video') {
            const mediaViewer = document.getElementById('media-viewer');
            const mediaContent = mediaViewer.querySelector('.media-content');
            
            mediaContent.innerHTML = '';
            
            if (fileType === 'image') {
                const img = document.createElement('img');
                img.src = `/download/${encodeURIComponent(filename)}`;
                img.alt = filename;
                mediaContent.appendChild(img);
            } else {
                const video = document.createElement('video');
                video.src = `/download/${encodeURIComponent(filename)}`;
                video.controls = true;
                video.autoplay = true;
                mediaContent.appendChild(video);
            }
            
            mediaViewer.classList.add('active');
        } else {
            downloadFile(filename);
        }
    }
    
    // Download file
    function downloadFile(filename) {
        window.location.href = `/download/${encodeURIComponent(filename)}`;
    }
    
    // Delete file
    function deleteFile(filename) {
        if (!confirm(`Are you sure you want to delete "${filename}"?`)) return;
        
        fetch(`/files/${encodeURIComponent(filename)}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                loadFiles(); // Refresh the file list
            } else {
                alert('Failed to delete file');
            }
        })
        .catch(error => {
            console.error('Error deleting file:', error);
            alert('Error deleting file');
        });
    }
});

// In your main.js where you handle successful file loading
fetch('/files')
    .then(response => response.json())
    .then(files => {
        if (files.length === 0) {
            fileList.innerHTML = '<div class="loading">No files found</div>';
            return;
        }
        
        fileList.innerHTML = '';
        files.forEach(file => {
            const fileItem = createFileItem(file);
            fileList.appendChild(fileItem);
        });
        
        // Notify media viewer to update its listeners
        if (window.mediaViewer && window.mediaViewer.handleFileListUpdate) {
            window.mediaViewer.handleFileListUpdate();
        }
    })
    .catch(error => {
        console.error('Error loading files:', error);
        fileList.innerHTML = '<div class="loading error">Failed to load files</div>';
    });
