// frontend/js/add-book.js
// Add Book page — includes Google Books lookup

const API_BASE_URL = "https://book-log-app.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  const bookForm = document.getElementById("bookForm");
  const searchBtn = document.getElementById("googleSearchBtn");
  const searchInput = document.getElementById("googleSearchInput");

  // -----------------------------
  // 1. GOOGLE BOOKS SEARCH
  // -----------------------------
  searchBtn?.addEventListener("click", async () => {
    const title = searchInput.value.trim();
    if (!title) {
      alert("Enter a title to search.");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/googlebooks?title=${encodeURIComponent(title)}`
      );

      const data = await res.json();

      if (!data.results || data.results.length === 0) {
        alert("No books found");
        return;
      }

      const book = data.results[0]; // take first result

      document.getElementById("title").value = book.title || "";
      document.getElementById("author").value = (book.authors || []).join(", ");
      document.getElementById("coverImage").value = book.coverImage || "";
      document.getElementById("description").value = book.description || "";

      console.log("Google Books result:", book);

    } catch (err) {
      console.error("Google Books error:", err);
      alert("Failed to search book info");
    }
  });

  // -----------------------------
  // 2. SUBMIT BOOK TO DATABASE
  // -----------------------------
  if (!bookForm) return;

  bookForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const author = document.getElementById("author").value.trim();
    const coverImage = document.getElementById("coverImage").value.trim();
    const genreTagsRaw = document.getElementById("genreTags").value.trim();
    const description = document.getElementById("description").value.trim();

    if (!title) {
      alert("Please add a title.");
      return;
    }

    const genreTags = genreTagsRaw
      ? genreTagsRaw.split(",").map((g) => g.trim()).filter(Boolean)
      : [];

    try {
      const res = await fetch(`${API_BASE_URL}/api/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          author,
          coverImage,
          genreTags,
          description,
        }),
      });

      if (!res.ok) {
        alert("Failed to save book");
        return;
      }

      alert("Book added!");
      window.location.href = "index.html";
    } catch (err) {
      console.error(err);
      alert("Error saving book");
    }
  });
});
