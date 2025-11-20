// backend/models/Note.js
const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    title: { type: String },
    chapter: { type: Number },
    pages: { type: String },
    dateLogged: { type: Date },
    thoughts: { type: String, required: true },
    favouriteQuotes: [{ type: String }],
    rating: { type: Number, min: 0, max: 5 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Note', noteSchema);
