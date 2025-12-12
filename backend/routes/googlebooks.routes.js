const express = require('express');
const router = express.Router();

// Fix for node-fetch on older Node versions
let fetch;
(async () => {
  fetch = (await import('node-fetch')).default;
})();

router.get('/', async (req, res) => {
  const title = req.query.title;

  if (!title) {
    return res.status(400).json({ message: "Missing title parameter" });
  }

  try {
    const apiKey = process.env.GOOGLE_BOOKS_KEY;
    const url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}&key=${apiKey}`;

    // Wait until fetch is loaded
    if (!fetch) {
      fetch = (await import('node-fetch')).default;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return res.json({ message: "No results found", raw: data });
    }

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
