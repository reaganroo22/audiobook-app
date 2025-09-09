const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const llamaParseRouter = require('./routes/llamaParse');
const geminiSummaryRouter = require('./routes/chatgpt'); // Now using Gemini for summaries
const geminiRouter = require('./routes/gemini');
const audiobookRouter = require('./routes/audiobook');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory');
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('📋 File filter check:', file.originalname, file.mimetype);
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'text/plain' ||
        file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and TXT files are allowed'), false);
    }
  }
});

app.use('/api/llama-parse', llamaParseRouter);
app.use('/api/chatgpt', geminiSummaryRouter); // Keep same endpoint for compatibility
app.use('/api/gemini', geminiRouter);
app.use('/api/audiobook', audiobookRouter);
app.use('/api/user-audiobooks', require('./routes/user-audiobooks'));

app.use('/audio', express.static(path.join(__dirname, '../audio')));

app.post('/api/upload', upload.single('document'), (req, res) => {
  console.log('📤 Upload attempt received');
  console.log('Request body:', req.body);
  console.log('Request file:', req.file);
  
  if (!req.file) {
    console.error('❌ No file uploaded');
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  console.log('✅ File uploaded successfully:', req.file.filename);
  
  res.json({
    message: 'File uploaded successfully',
    filename: req.file.filename,
    originalname: req.file.originalname
  });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});