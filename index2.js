const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;
const __dirnameResolved = path.resolve();
const UPLOAD_DIR = path.join(__dirnameResolved, 'public', 'uploads');

// Serve static files (HTML and uploaded files)
app.use(express.static(path.join(__dirnameResolved, 'public')));

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure multer for unlimited file size
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, Date.now() + '-' + safeName);
    },
});
const upload = multer({ storage });

// Upload route
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded');
    res.redirect('/');
});

// List files
app.get('/files', (req, res) => {
    fs.readdir(UPLOAD_DIR, (err, files) => {
        if (err) return res.status(500).json({ error: 'Failed to read files' });
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
    console.log(`✅ Server running at: http://localhost:${PORT}`);

    // Optional: Auto-run cloudflared
    exec('cloudflared tunnel run my-tunnel', (err, stdout, stderr) => {
        if (err) {
            console.error('❌ Failed to start cloudflared tunnel:', err.message);
        } else {
            console.log('🌐 Cloudflared tunnel started');
            console.log(stdout);
        }
    });
});
