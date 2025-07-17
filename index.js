const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// __dirname is built-in with CommonJS
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = path.join(__dirname, 'public', 'uploads');

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Allow JSON body

// Ensure the upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Route to list uploaded files
app.get('/files', (req, res) => {
    fs.readdir(UPLOAD_DIR, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return res.status(500).json({ error: 'Error reading files' });
        }
        res.json(files);
    });
});

// Route to upload a file (base64)
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

// Route to download a file
app.get('/download/:filename', (req, res) => {
    const fileName = path.basename(req.params.filename);
    const filePath = path.join(UPLOAD_DIR, fileName);

    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).send('File not found');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
