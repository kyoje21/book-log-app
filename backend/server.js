// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const bookRoutes = require('./routes/book.routes');
const notesRoutes = require('./routes/notes.routes');
const googleBooksRoutes = require('./routes/googlebooks.routes');
const rateLimit = require("express-rate-limit");



const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/book_log_app';

// Middleware
app.use(cors());
app.use(express.json());
// Rate limit Google Books endpoint to prevent abuse
const searchLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 5,               // allow only 5 searches per 10 seconds per IP
  message: { error: "Too many requests, please slow down." }
});


// API routes (no auth)
app.use('/api/books', bookRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/googlebooks', searchLimiter, googleBooksRoutes);



// (Optional) health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
