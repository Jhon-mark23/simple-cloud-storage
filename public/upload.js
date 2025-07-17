document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('upload-form');
    const fileInput = document.getElementById('file-input');
    const uploadArea = document.querySelector('.upload-area');
    const progressContainer = document.querySelector('.progress-container');
    const progressBar = document.querySelector('.progress');
    const progressText = document.querySelector('.progress-text');
    const uploadBtn = document.querySelector('.upload-btn');
    const uploadStatus = document.getElementById('upload-status');
    
    let selectedFile = null;
    
    // Drag and drop functionality
    uploadForm.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadForm.classList.add('active');
    });
    
    uploadForm.addEventListener('dragleave', () => {
        uploadForm.classList.remove('active');
    });
    
    uploadForm.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadForm.classList.remove('active');
        
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFileSelection(e.dataTransfer.files[0]);
        }
    });
    
    // File input change
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
            handleFileSelection(fileInput.files[0]);
        }
    });
    
    // Form submission
    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!selectedFile) {
            showStatus('Please select a file first', 'error');
            return;
        }
        
        uploadFile(selectedFile);
    });
    
    // Handle file selection
    function handleFileSelection(file) {
        selectedFile = file;
        
        // Update UI to show selected file
        uploadArea.querySelector('h3').textContent = file.name;
        uploadArea.querySelector('p').textContent = formatFileSize(file.size);
        
        // Enable upload button
        uploadBtn.disabled = false;
    }
    
    // Upload file to server
    function uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);
        
        const xhr = new XMLHttpRequest();
        
        // Progress tracking
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                progressBar.style.width = `${percent}%`;
                progressText.textContent = `${percent}%`;
                
                if (percent === 100) {
                    progressText.textContent = 'Processing...';
                }
            }
        });
        
        // Show progress container
        progressContainer.style.display = 'block';
        
        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    showStatus('File uploaded successfully!', 'success');
                    resetForm();
                } else {
                    showStatus('Error uploading file', 'error');
                }
            }
        };
        
        xhr.open('POST', '/upload', true);
        xhr.send(formData);
    }
    
    // Show status message
    function showStatus(message, type) {
        uploadStatus.textContent = message;
        uploadStatus.className = `upload-status ${type}`;
    }
    
    // Reset form after upload
    function resetForm() {
        fileInput.value = '';
        selectedFile = null;
        progressContainer.style.display = 'none';
        progressBar.style.width = '0%';
        progressText.textContent = '0%';
        uploadBtn.disabled = true;
        
        // Reset upload area text
        uploadArea.querySelector('h3').textContent = 'Drag & Drop files here';
        uploadArea.querySelector('p').textContent = 'or';
    }
    
    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
});
