document.addEventListener('DOMContentLoaded', function() {
    const mediaViewer = document.getElementById('media-viewer');
    const closeBtn = mediaViewer.querySelector('.close-btn');
    const mediaContent = mediaViewer.querySelector('.media-content');
    
    // Store current media state
    let currentMedia = null;
    let mediaElements = [];
    let currentIndex = 0;

    // Initialize media viewer
    function initMediaViewer() {
        // Clear previous listeners
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.removeEventListener('click', handleViewClick);
            btn.addEventListener('click', handleViewClick);
        });
    }

    // Handle view button clicks
    function handleViewClick(e) {
        e.preventDefault();
        const fileItem = this.closest('.file-item');
        const fileName = fileItem.querySelector('.file-name').textContent.trim();
        const fileType = getFileType(fileName);
        
        // Get all files in the list
        mediaElements = Array.from(document.querySelectorAll('.file-item'))
            .map(item => item.querySelector('.file-name').textContent.trim())
            .filter(name => {
                const type = getFileType(name);
                return type === 'image' || type === 'video';
            });
        
        currentIndex = mediaElements.indexOf(fileName);
        
        if (fileType === 'image' || fileType === 'video') {
            showMedia(fileName, fileType);
        } else {
            window.location.href = `/download/${encodeURIComponent(fileName)}`;
        }
    }

    // Show media in viewer
    function showMedia(filename, fileType) {
        mediaViewer.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Clear previous media
        mediaContent.innerHTML = `
            <div class="media-loading">
                <div class="loading-spinner"></div>
                Loading...
            </div>
        `;
        
        currentMedia = { filename, fileType };
        
        const mediaElement = fileType === 'image' ? 
            createImageElement(filename) : 
            createVideoElement(filename);
        
        mediaElement.onload = mediaElement.onloadeddata = () => {
            mediaContent.innerHTML = '';
            mediaContent.appendChild(mediaElement);
            addNavigationControls();
        };
        
        mediaElement.onerror = () => {
            mediaContent.innerHTML = '<div class="media-error">Failed to load media</div>';
        };
        
        // Preload the media
        mediaContent.appendChild(mediaElement);
    }

    // Create image element
    function createImageElement(filename) {
        const img = new Image();
        img.src = `/download/${encodeURIComponent(filename)}`;
        img.alt = filename;
        img.className = 'media-image';
        return img;
    }

    // Create video element
    function createVideoElement(filename) {
        const video = document.createElement('video');
        video.src = `/download/${encodeURIComponent(filename)}`;
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;
        video.className = 'media-video';
        return video;
    }

    // Add navigation controls
    function addNavigationControls() {
        // Only add if multiple media files
        if (mediaElements.length > 1) {
            const prevBtn = document.createElement('button');
            prevBtn.className = 'nav-btn prev-btn';
            prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
            prevBtn.addEventListener('click', showPrevMedia);
            
            const nextBtn = document.createElement('button');
            nextBtn.className = 'nav-btn next-btn';
            nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
            nextBtn.addEventListener('click', showNextMedia);
            
            mediaContent.appendChild(prevBtn);
            mediaContent.appendChild(nextBtn);
        }
    }

    // Show previous media
    function showPrevMedia() {
        currentIndex = (currentIndex - 1 + mediaElements.length) % mediaElements.length;
        const filename = mediaElements[currentIndex];
        const fileType = getFileType(filename);
        showMedia(filename, fileType);
    }

    // Show next media
    function showNextMedia() {
        currentIndex = (currentIndex + 1) % mediaElements.length;
        const filename = mediaElements[currentIndex];
        const fileType = getFileType(filename);
        showMedia(filename, fileType);
    }

    // Close media viewer
    function closeMediaViewer() {
        mediaViewer.classList.remove('active');
        document.body.style.overflow = '';
        
        // Pause and reset any video
        const video = mediaContent.querySelector('video');
        if (video) {
            video.pause();
            video.currentTime = 0;
        }
        
        // Clear current media
        currentMedia = null;
        mediaContent.innerHTML = '';
    }

    // Get file type
    function getFileType(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        const videoTypes = ['mp4', 'webm', 'ogg', 'mov', 'avi'];
        
        if (imageTypes.includes(extension)) return 'image';
        if (videoTypes.includes(extension)) return 'video';
        return 'other';
    }

    // Event listeners
    closeBtn.addEventListener('click', closeMediaViewer);
    
    mediaViewer.addEventListener('click', (e) => {
        if (e.target === mediaViewer) {
            closeMediaViewer();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (!mediaViewer.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeMediaViewer();
        } else if (e.key === 'ArrowLeft') {
            showPrevMedia();
        } else if (e.key === 'ArrowRight') {
            showNextMedia();
        }
    });

    // Reinitialize when files are loaded/refreshed
    function handleFileListUpdate() {
        initMediaViewer();
    }

    // Expose for other scripts
    window.mediaViewer = {
        init: initMediaViewer,
        handleFileListUpdate
    };

    // Initial setup
    initMediaViewer();
});
