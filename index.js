const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;
const __dirnameResolved = path.resolve();
const UPLOAD_DIR = path.join(__dirnameResolved, 'public', 'uploads');

// Ensure upload directory exists
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Security headers
app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src 'self'");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    next();
});

// Serve static files
app.use(express.static(path.join(__dirnameResolved, 'public')));
app.use('/uploads', express.static(UPLOAD_DIR));

// Configure multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, `${Date.now()}-${safeName}`);
    }
});

// Accept all file types and remove size limits
const upload = multer({
    storage,
    limits: { fileSize: Infinity }
});

// Upload route
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');
    res.redirect('/');
});

// File list route
app.get('/files', (req, res) => {
    fs.readdir(UPLOAD_DIR, (err, files) => {
        if (err) {
            console.error('❌ Error reading upload directory:', err);
            return res.status(500).json({ error: 'Failed to read files' });
        }
        res.json(files);
    });
});

// Download route
app.get('/download/:filename', (req, res) => {
    const safeName = path.basename(req.params.filename);
    const filePath = path.join(UPLOAD_DIR, safeName);

    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).send('File not found');
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server is running at http://localhost:${PORT}`);

    // Automatically start cloudflared tunnel
    exec('cloudflared tunnel run my-tunnel', (error, stdout, stderr) => {
        if (error) {
            console.error('❌ Cloudflared failed:', error.message);
        } else {
            console.log('🌐 Cloudflared tunnel started successfully');
            console.log(stdout);
        }

        if (stderr) {
            console.error(stderr);
        }
    });
});
