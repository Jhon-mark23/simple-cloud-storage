const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const app = express();

// Configuration
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = path.join(__dirname, 'public', 'uploads');

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Ensure the upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// List files
app.get('/files', (req, res) => {
    fs.readdir(UPLOAD_DIR, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return res.status(500).json({ error: 'Error reading files' });
        }
        res.json(files);
    });
});

// Upload base64
app.post('/upload', (req, res) => {
    const { fileData, fileName } = req.body;

    if (!fileData || !fileName) {
        return res.status(400).send('Missing file data or filename');
    }

    const safeFileName = path.basename(fileName);
    const filePath = path.join(UPLOAD_DIR, safeFileName);
    const base64Data = fileData.replace(/^data:.+;base64,/, '');

    fs.writeFile(filePath, base64Data, 'base64', (err) => {
        if (err) {
            console.error('Error saving file:', err);
            return res.status(500).send('Error saving file');
        }
        res.redirect('/');
    });
});

// Download route
app.get('/download/:filename', (req, res) => {
    const fileName = path.basename(req.params.filename);
    const filePath = path.join(UPLOAD_DIR, fileName);

    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).send('File not found');
    }
});

// Start server + cloudflared
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);

    // Start cloudflared tunnel
    const tunnel = exec('cloudflared tunnel run my-tunnel', (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Cloudflared error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`⚠️ Cloudflared stderr: ${stderr}`);
        }
        if (stdout) {
            console.log(`🌐 Cloudflared output:\n${stdout}`);
        }
    });

    // Optional: log cloudflared real-time output
    tunnel.stdout.on('data', data => process.stdout.write(`[CLOUDFLARE] ${data}`));
    tunnel.stderr.on('data', data => process.stderr.write(`[CLOUDFLARE] ${data}`));
});
