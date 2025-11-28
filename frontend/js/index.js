// frontend/js/index.js
// Book list page — uses MongoDB backend via REST API (no login)

const API_BASE_URL = "https://book-log-app.onrender.com";


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
  const container = document.getElementById("book-list");
  container.innerHTML = "";

  const booksPerRow = 5; // how many books fit per shelf

  for (let i = 0; i < books.length; i += booksPerRow) {
    const rowBooks = books.slice(i, i + booksPerRow);

    // 1. Book row
    const shelfRow = document.createElement("div");
    shelfRow.classList.add("shelf-row");

    rowBooks.forEach(book => {
      shelfRow.innerHTML += `
        <div class="book-item">
          <img src="${book.coverImage}" class="book-cover">
          <div class="book-hover">
            <h3>${book.title}</h3>
            <div class="book-actions">
              <button class="view-btn" onclick="openBook('${book._id}')">Open</button>
              <button class="delete-btn" onclick="deleteBook('${book._id}')">Delete</button>
            </div>
          </div>
        </div>
      `;
    });

    container.appendChild(shelfRow);

    // 2. Shelf graphic row
    const shelfGraphic = document.createElement("div");
    shelfGraphic.classList.add("shelf-svg-row");
    container.appendChild(shelfGraphic);
  }

  // OPTIONAL — extra empty shelves
  for (let k = 0; k < 2; k++) {
    const emptyRow = document.createElement("div");
    emptyRow.classList.add("shelf-row", "empty");
    container.appendChild(emptyRow);

    const shelfGraphic = document.createElement("div");
    shelfGraphic.classList.add("shelf-svg-row");
    container.appendChild(shelfGraphic);
  }
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
