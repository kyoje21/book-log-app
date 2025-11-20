// backend/routes/notes.routes.js
const express = require('express');
const Note = require('../models/Note');

const router = express.Router();

// PUT /api/notes/:id - update note
router.put('/:id', async (req, res) => {
  try {
    const { title, chapter, pages, dateLogged, thoughts, favouriteQuotes, rating } = req.body;

    const updated = await Note.findByIdAndUpdate(
      req.params.id,
      {
        ...(title !== undefined && { title }),
        ...(chapter !== undefined && { chapter }),
        ...(pages !== undefined && { pages }),
        ...(dateLogged !== undefined && { dateLogged }),
        ...(thoughts !== undefined && { thoughts }),
        ...(favouriteQuotes !== undefined && { favouriteQuotes }),
        ...(rating !== undefined && { rating }),
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Note not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update note', error: err.message });
  }
});

// DELETE /api/notes/:id - delete note
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Note.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete note', error: err.message });
  }
});

module.exports = router;
