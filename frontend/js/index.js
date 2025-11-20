// frontend/js/index.js
// Book list page — uses MongoDB backend via REST API (no login)

const API_BASE_URL = 'http://localhost:4000'; // Change this to your deployed backend URL later

async function fetchBooks() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/books`);
    if (!res.ok) {
      throw new Error('Failed to fetch books');
    }
    const books = await res.json();
    renderBooks(books);
  } catch (err) {
    console.error(err);
    const list = document.getElementById('book-list');
    if (list) {
      list.innerHTML = '<p>Could not load books. Is the backend running?</p>';
    }
  }
}

function renderBooks(books) {
  const list = document.getElementById('book-list');
  if (!list) return;

  if (!books.length) {
    list.innerHTML = '<p>You have no books yet. Click “Add New Book” to start.</p>';
    return;
  }

  list.innerHTML = books
    .map(
      (book) => `
      <article class="book-card">
        <img
          src="${book.coverImage || 'https://via.placeholder.com/120x180?text=No+Cover'}"
          alt="${book.title}"
          class="book-card-cover"
        />
        <div class="book-card-body">
          <h2>${book.title}</h2>
          <p class="book-card-author">${book.author || 'Unknown author'}</p>
          <p class="book-card-genres">
            ${(book.genreTags || []).join(', ') || 'No genre tags yet'}
          </p>
          <div style="margin-top:0.5rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
            <button class="btn-secondary" onclick="openBook('${book._id}')">Open notes</button>
            <button class="btn-secondary" onclick="deleteBook('${book._id}')">Delete</button>
          </div>
        </div>
      </article>
    `
    )
    .join('');
}

function openBook(id) {
  window.location.href = 'book.html?id=' + encodeURIComponent(id);
}

async function deleteBook(id) {
  if (!confirm('Delete this book and all its notes?')) return;
  try {
    const res = await fetch(`${API_BASE_URL}/api/books/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Failed to delete book');
    }
    fetchBooks();
  } catch (err) {
    alert(err.message);
  }
}

document.addEventListener('DOMContentLoaded', fetchBooks);
