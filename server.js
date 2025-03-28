const express = require('express');
const multer = require('multer');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const PORT = 3000;

// Set storage engine (Preserve Original File Name)
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Keep original file name
  }
});

// Initialize multer for file uploads
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images & PDFs are allowed!'));
    }
  }
});

// MySQL Database Connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'khushabu2005', // Replace with your actual password
  database: 'resume_db'
});

connection.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    return;
  }
  console.log('Connected to MySQL database');
});

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));
app.use(express.json()); // Enable JSON parsing for POST requests

// Serve the index page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle Resume Upload and Save Data to MySQL
app.post('/upload-resume', upload.single('resume-file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please select a file to upload.' });
  }

  const { name, email, phone } = req.body;
  const resumeFileName = req.file.originalname; // Use original file name

  const sql = 'INSERT INTO resumes (name, email, phone, resume_filename) VALUES (?, ?, ?, ?)';
  connection.query(sql, [name, email, phone, resumeFileName], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error. Try again later.' });
    }
    res.json({ message: 'Resume uploaded successfully!', fileName: resumeFileName });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
