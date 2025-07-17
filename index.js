const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const mime = require('mime-types');

const app = express();
const PORT = process.env.PORT || 8080;
const __dirnameResolved = path.resolve();
const UPLOAD_DIR = path.join(__dirnameResolved, 'public', 'Uploads');
const PUBLIC_DIR = path.join(__dirnameResolved, 'public');

// Ensure upload and public directories exist
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

// Security headers
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; font-src 'self' fonts.googleapis.com fonts.gstatic.com; img-src 'self' data:; video-src 'self'; style-src 'self' fonts.googleapis.com; child-src 'self'"
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Serve static files, including uploads and public directory
app.use(express.static(PUBLIC_DIR));
app.use('/uploads', express.static(UPLOAD_DIR));

// Serve index.html as the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Configure multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, `${Date.now()}-${safeName}`);
    },
});
const upload = multer({ storage });

// Upload route without compression
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.redirect('/'); // Redirect to index.html
});

// List files
app.get('/files', (req, res) => {
    fs.readdir(UPLOAD_DIR, (err, files) => {
        if (err) {
            console.error('❌ Error reading upload directory:', err);
            return res.status(500).json({ error: 'Failed to read files' });
        }
        res.json(files); // List all files
    });
});

// Download route with image and video validation (optional fallback)
app.get('/download/:filename', (req, res) => {
    const safeName = path.basename(req.params.filename);
    const filePath = path.join(UPLOAD_DIR, safeName);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }

    const mimeType = mime.lookup(safeName);
    if (mimeType && (mimeType.startsWith('image/') || mimeType.startsWith('video/'))) {
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `inline; filename="${safeName}"`);
    } else {
        res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
    }
    res.sendFile(filePath);
});

// Delete route
app.delete('/files/:filename', (req, res) => {
    const safeName = path.basename(req.params.filename);
    const filePath = path.join(UPLOAD_DIR, safeName);

    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
            res.json({ message: 'File deleted' });
        } catch (err) {
            console.error('❌ Error deleting file:', err);
            res.status(500).json({ error: 'Failed to delete file' });
        }
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

// Start server and run Cloudflare tunnel
app.listen(PORT, () => {
    console.log(`✅ Server running at: http://localhost:${PORT}`);

    // Start Cloudflare tunnel after successful server start
    exec('cloudflared tunnel run my-tunnel', (err, stdout, stderr) => {
        if (err) {
            console.error('❌ Failed to start cloudflared tunnel:', err.message);
            return;
        }
        console.log('🌐 Cloudflare tunnel started successfully');
        console.log(stdout);
        if (stderr) {
            console.error('⚠️ Cloudflare tunnel warnings:', stderr);
        }
    });
});
