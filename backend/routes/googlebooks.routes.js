const express = require('express');
const router = express.Router();
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

router.get('/', async (req, res) => {
  const { title } = req.query;
  if (!title) {
    return res.status(400).json({ message: 'Missing title parameter' });
  }

  try {
    const apiKey = process.env.GOOGLE_BOOKS_KEY;
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      title
    )}&maxResults=1&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return res.status(404).json({ message: 'No results found' });
    }

    const volume = data.items[0].volumeInfo;

    res.json({
      title: volume.title || "",
      authors: volume.authors || [],
      description: volume.description || "",
      coverImage:
        volume.imageLinks?.thumbnail ||
        volume.imageLinks?.smallThumbnail ||
        "",
      raw: volume,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch data', error: err.message });
  }
});

module.exports = router;
