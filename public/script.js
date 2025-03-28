const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();
const PORT = 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Upload Page
app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

// Handle Resume Upload
app.post('/upload-resume', upload.single('resume-file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please select a file to upload.' });
  }
  res.json({ message: 'Resume uploaded successfully!', fileName: req.file.filename });
});

// Handle Apply Button Clicks
app.post('/apply', (req, res) => {
  res.json({ message: 'Application submitted successfully!' });
});

// Function to open new upload window
function openResumeUpload() {
  const newTab = window.open('upload.html', '_blank');
  if (!newTab) {
    alert('Popup blocked! Please allow popups for this site.');
  }
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


/* script.js */
document.getElementById("resumeForm").addEventListener("submit", function(event) {
    event.preventDefault();
    alert("Form submitted successfully!");
});


document.getElementById("resumeForm").addEventListener("submit", function(event) {
  event.preventDefault();
  document.getElementById("popup").style.display = "flex";
});

function closePopup() {
  document.getElementById("popup").style.display = "none";
}
document.getElementById('resumeForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const formData = new FormData(this);

  try {
      const response = await fetch('/upload-resume', {
          method: 'POST',
          body: formData
      });
      const result = await response.json();

      // Show modal on successful submission
      document.getElementById('modal-message').textContent = result.message;
      document.getElementById('popupModal').style.display = "block";
  } catch (error) {
      document.getElementById('modal-message').textContent = 'Upload failed. Please try again.';
      document.getElementById('popupModal').style.display = "block";
  }
});

// Close modal when clicking the close button
document.querySelector('.close').addEventListener('click', function () {
  document.getElementById('popupModal').style.display = "none";
});

// Close modal when clicking outside the modal
window.onclick = function (event) {
  const modal = document.getElementById('popupModal');
  if (event.target === modal) {
      modal.style.display = "none";
  }
}
