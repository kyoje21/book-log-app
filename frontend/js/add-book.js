// frontend/js/add-book.js
// Add book page — sends data to MongoDB backend

const API_BASE_URL = "https://book-log-app.onrender.com";

document.addEventListener('DOMContentLoaded', () => {
  const bookForm = document.getElementById('bookForm');
  if (!bookForm) return;

  bookForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value.trim();
    const author = document.getElementById('author').value.trim();
    const coverImage = document.getElementById('coverImage').value.trim();
    const genreTagsRaw = document.getElementById('genreTags').value.trim();
    const description = document.getElementById('description').value.trim();

    if (!title) {
      alert('Please add a title.');
      return;
    }

    const genreTags = genreTagsRaw
      ? genreTagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    try {
      const res = await fetch(`${API_BASE_URL}/api/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          author,
          coverImage,
          genreTags,
          description,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to save book');
      }

      alert('Book added!');
      window.location.href = 'index.html';
    } catch (err) {
      alert(err.message);
    }
  });
});
