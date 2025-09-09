const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// In-memory storage for user audiobooks (in production, use a database)
const userAudiobooks = {};

// Get user's audiobooks
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  const audiobooks = userAudiobooks[userId] || [];
  
  res.json({
    success: true,
    audiobooks: audiobooks
  });
});

// Save audiobook to user profile
router.post('/save', (req, res) => {
  const { userId, audiobook } = req.body;
  
  if (!userAudiobooks[userId]) {
    userAudiobooks[userId] = [];
  }
  
  // Add timestamp and ID
  audiobook.id = Date.now();
  audiobook.createdAt = new Date().toISOString();
  audiobook.listened = false;
  
  userAudiobooks[userId].push(audiobook);
  
  res.json({
    success: true,
    audiobook: audiobook
  });
});

module.exports = router;