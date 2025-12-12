const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

router.get('/', async (req, res) => {
  const title = req.query.title;

  if (!title) {
    return res.status(400).json({ message: "Missing title parameter" });
  }

  try {
    const apiKey = process.env.GOOGLE_BOOKS_KEY;
    const url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    // If Google Books returns nothing
    if (!data.items || data.items.length === 0) {
      return res.json({ message: "No results found", raw: data });
    }

    // Extract clean results (not just first)
    const books = data.items.map(item => {
      const info = item.volumeInfo;
      return {
        title: info.title || "Unknown Title",
        authors: info.authors || [],
        description: info.description || "",
        coverImage:
          info.imageLinks?.thumbnail ||
          info.imageLinks?.smallThumbnail ||
          "",
        raw: info
      };
    });

    res.json({ results: books });

  } catch (err) {
    console.error("Google Books API Error:", err);
    res.status(500).json({ message: "Failed to fetch data", error: err.message });
  }
});

module.exports = router;
