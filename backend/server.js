// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const bookRoutes = require('./routes/book.routes');
const notesRoutes = require('./routes/notes.routes');

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/book_log_app';

// Middleware
app.use(cors());
app.use(express.json());

// API routes (no auth)
app.use('/api/books', bookRoutes);
app.use('/api/notes', notesRoutes);

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
