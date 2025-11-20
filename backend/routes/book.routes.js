// backend/routes/book.routes.js
const express = require('express');
const Book = require('../models/Book');
const Note = require('../models/Note');

const router = express.Router();

// GET /api/books - list all books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch books', error: err.message });
  }
});

// POST /api/books - create a book
router.post('/', async (req, res) => {
  try {
    const { title, author, coverImage, genreTags, description } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    const book = new Book({
      title,
      author: author || '',
      coverImage: coverImage || '',
      genreTags: Array.isArray(genreTags) ? genreTags : [],
      description: description || '',
    });
    const saved = await book.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create book', error: err.message });
  }
});

// GET /api/books/:id - get single book
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch book', error: err.message });
  }
});

// PUT /api/books/:id - update book
router.put('/:id', async (req, res) => {
  try {
    const { title, author, coverImage, genreTags, description } = req.body;
    const updated = await Book.findByIdAndUpdate(
      req.params.id,
      {
        ...(title !== undefined && { title }),
        ...(author !== undefined && { author }),
        ...(coverImage !== undefined && { coverImage }),
        ...(genreTags !== undefined && { genreTags }),
        ...(description !== undefined && { description }),
      },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Book not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update book', error: err.message });
  }
});

// DELETE /api/books/:id - delete book and its notes
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Book.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Book not found' });

    await Note.deleteMany({ book: req.params.id });
    res.json({ message: 'Book and notes deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete book', error: err.message });
  }
});

// GET /api/books/:bookId/notes - notes for a book
router.get('/:bookId/notes', async (req, res) => {
  try {
    const notes = await Note.find({ book: req.params.bookId }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notes', error: err.message });
  }
});

// POST /api/books/:bookId/notes - create note for a book
router.post('/:bookId/notes', async (req, res) => {
  try {
    const { title, chapter, pages, dateLogged, thoughts, favouriteQuotes, rating } = req.body;
    if (!thoughts) {
      return res.status(400).json({ message: 'Thoughts are required' });
    }

    const note = new Note({
      book: req.params.bookId,
      title: title || '',
      chapter: typeof chapter === 'number' ? chapter : undefined,
      pages: pages || '',
      dateLogged: dateLogged ? new Date(dateLogged) : undefined,
      thoughts,
      favouriteQuotes: Array.isArray(favouriteQuotes) ? favouriteQuotes : [],
      rating: typeof rating === 'number' ? rating : 0,
    });

    const saved = await note.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create note', error: err.message });
  }
});

module.exports = router;
