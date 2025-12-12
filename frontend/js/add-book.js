// frontend/js/add-book.js

const API_BASE_URL = "https://book-log-app.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  const bookForm = document.getElementById("bookForm");

  // SEARCH ELEMENTS
  const searchBtn = document.getElementById("googleSearchBtn");
  const searchInput = document.getElementById("googleSearchInput");
  const resultsBox = document.getElementById("googleResults");

  // -----------------------------
  // GOOGLE BOOKS SEARCH
  // -----------------------------
  searchBtn?.addEventListener("click", async () => {
    const query = searchInput.value.trim();
    if (!query) {
      alert("Enter a title to search.");
      return;
    }

    resultsBox.innerHTML = `<div class="google-result-item">Searching...</div>`;
    resultsBox.classList.remove("hidden");

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/googlebooks?title=${encodeURIComponent(query)}`
      );
      const data = await res.json();

      if (!data.results || data.results.length === 0) {
        resultsBox.innerHTML = `<div class="google-result-item">No results found</div>`;
        return;
      }

      // LIMIT RESULTS TO 5
      const limited = data.results.slice(0, 5);

      resultsBox.innerHTML = limited
        .map(
          (b, i) => `
        <div class="google-result-item" data-index="${i}">
          <strong>${b.title}</strong><br>
          <span>${(b.authors || []).join(", ")}</span>
        </div>
      `
        )
        .join("");

      // CLICK TO AUTOFILL
      document.querySelectorAll(".google-result-item").forEach((item) => {
        item.addEventListener("click", () => {
          const idx = item.dataset.index;
          const chosen = limited[idx];

          document.getElementById("title").value = chosen.title || "";
          document.getElementById("author").value = (chosen.authors || []).join(", ");
          document.getElementById("coverImage").value = chosen.coverImage || "";
          document.getElementById("description").value = chosen.description || "";

          resultsBox.classList.add("hidden"); // hide dropdown
        });
      });

    } catch (err) {
      resultsBox.innerHTML = `<div class="google-result-item">Error fetching results</div>`;
      console.error(err);
    }
  });

  // -----------------------------
  // SUBMIT BOOK
  // -----------------------------
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
        headers: { "Content-Type": "application/json" },
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
