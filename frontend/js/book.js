// frontend/js/book.js
// Book detail page logic with edit modal + note modal + rating system

const API_BASE_URL = "https://book-log-app.onrender.com";

/* ==========================================================
   GLOBAL STATE
========================================================== */
let currentBook = null;
let currentBookId = null;
let editingNoteId = null;
let currentRating = 0;

/* ==========================================================
   DOM ELEMENT REFERENCES
========================================================== */
let bookTitleEl,
  infoBookTitleEl,
  bookAuthorEl,
  bookGenresEl,
  bookDescriptionEl,
  bookCoverEl,
  notesListEl;

let noteModalEl,
  addNoteBtn,
  closeModalBtn,
  noteCancelBtn,
  noteForm,
  noteFormTitle,
  noteSubmitBtn;

let noteTitleInput,
  noteChapterInput,
  notePagesInput,
  noteDateInput,
  noteThoughtsInput,
  noteQuotesInput;

let ratingStarsEl;

// Book edit modal references
let editBookModal,
  editBookBtn,
  closeBookEditBtn,
  cancelBookEditBtn,
  editBookForm,
  editBookTitle,
  editBookAuthor,
  editBookGenres,
  editBookCover,
  editBookDescription;

/* ==========================================================
   RATING STARS UTILITIES
========================================================== */
function setRating(value) {
  currentRating = value;
  if (!ratingStarsEl) return;

  const stars = ratingStarsEl.querySelectorAll(".star");
  stars.forEach((star) => {
    const v = Number(star.dataset.value);
    star.classList.toggle("active", v <= currentRating);
  });
}

function initRatingStars() {
  if (!ratingStarsEl) return;

  const stars = ratingStarsEl.querySelectorAll(".star");

  stars.forEach((star) => {
    const val = Number(star.dataset.value);

    // Click → set rating
    star.addEventListener("click", () => setRating(val));

    // Hover effect
    star.addEventListener("mouseenter", () => {
      stars.forEach((s) => {
        const v = Number(s.dataset.value);
        s.classList.toggle("hovered", v <= val);
      });
    });
  });

  // Remove hover when leaving the star area
  ratingStarsEl.addEventListener("mouseleave", () => {
    const stars = ratingStarsEl.querySelectorAll(".star");
    stars.forEach((s) => s.classList.remove("hovered"));
  });
}

/* ==========================================================
   NOTE MODAL HANDLING
========================================================== */
function openNoteModal(isEdit = false, note = null) {
  noteModalEl.classList.remove("hidden");
  document.body.classList.add("modal-open");

  // ⭐ IMPORTANT: re-bind the rating stars each time
  ratingStarsEl = document.getElementById("ratingStars");
  initRatingStars();

  if (isEdit && note) {
    editingNoteId = note._id;
    noteFormTitle.textContent = "Edit Note";
    noteSubmitBtn.textContent = "Update Note";

    noteTitleInput.value = note.title || "";
    noteChapterInput.value = note.chapter || "";
    notePagesInput.value = note.pages || "";
    noteDateInput.value = note.dateLogged ? note.dateLogged.slice(0, 10) : "";
    noteThoughtsInput.value = note.thoughts || "";
    noteQuotesInput.value = (note.favouriteQuotes || []).join("\n");

    setRating(note.rating || 0);
  } else {
    editingNoteId = null;
    noteForm.reset();
    setRating(0);
    noteFormTitle.textContent = "Add a New Note";
    noteSubmitBtn.textContent = "Save Note";
  }
}

function closeNoteModal() {
  noteModalEl.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

/* ==========================================================
   NOTES RENDERING
========================================================== */
function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString();
}

function renderNotes(notes) {
  if (!notes.length) {
    notesListEl.innerHTML = "<p>No notes yet.</p>";
    return;
  }

  notesListEl.innerHTML = notes
    .map((note) => {
      const stars =
        note.rating > 0
          ? "★".repeat(note.rating) + "☆".repeat(5 - note.rating)
          : "";

      return `
      <article class="note-card">
        <div class="note-card-header">
          <div>
            <div class="note-card-title">${note.title}</div>
            <div class="note-card-meta">
              ${note.chapter ? `Chapter ${note.chapter}` : ""}
              ${note.pages ? ` • Pages ${note.pages}` : ""}
              ${note.dateLogged ? ` • ${formatDate(note.dateLogged)}` : ""}
            </div>
          </div>
          <div class="note-card-rating">${stars}</div>
        </div>

        <p>${note.thoughts}</p>

        ${
          note.favouriteQuotes?.length
            ? `<p><strong>Favourite quotes:</strong><br>${note.favouriteQuotes
                .map((q) => `“${q}”`)
                .join("<br>")}</p>`
            : ""
        }

        <div class="note-card-actions">
          <button class="btn-secondary" data-note-id="${note._id}" data-action="edit">Edit</button>
          <button class="btn-secondary" data-note-id="${note._id}" data-action="delete">Delete</button>
        </div>
      </article>
    `;
    })
    .join("");
}

/* ==========================================================
   API CALLS
========================================================== */
async function loadBookAndNotes() {
  const params = new URLSearchParams(window.location.search);
  currentBookId = params.get("id");

  if (!currentBookId) {
    window.location.href = "index.html";
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/books/${currentBookId}`);
    currentBook = await res.json();

    // Populate book info
    bookTitleEl.textContent = currentBook.title;
    infoBookTitleEl.textContent = currentBook.title;
    bookAuthorEl.textContent = currentBook.author || "Unknown";
    bookGenresEl.textContent = currentBook.genreTags?.join(", ") || "None";
    bookDescriptionEl.textContent = currentBook.description || "No description.";
    bookCoverEl.src =
      currentBook.coverImage || "https://via.placeholder.com/140x210";

    refreshNotes();
  } catch {
    window.location.href = "index.html";
  }
}

async function refreshNotes() {
  const res = await fetch(`${API_BASE_URL}/api/books/${currentBookId}/notes`);
  const notes = await res.json();
  renderNotes(notes);
}

/* ==========================================================
   NOTE FORM SUBMIT
========================================================== */
async function handleNoteFormSubmit(e) {
  e.preventDefault();

  const payload = {
    title: noteTitleInput.value.trim(),
    chapter: noteChapterInput.value || null,
    pages: notePagesInput.value.trim(),
    dateLogged: noteDateInput.value
      ? new Date(noteDateInput.value).toISOString()
      : "",
    thoughts: noteThoughtsInput.value.trim(),
    favouriteQuotes: noteQuotesInput.value
      .split("\n")
      .map((q) => q.trim())
      .filter(Boolean),
    rating: currentRating,
  };

  try {
    if (editingNoteId) {
      await fetch(`${API_BASE_URL}/api/notes/${editingNoteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch(`${API_BASE_URL}/api/books/${currentBookId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    closeNoteModal();
    refreshNotes();
  } catch {
    alert("Error saving note");
  }
}

/* ==========================================================
   NOTE LIST CLICK HANDLER
========================================================== */
async function handleNotesListClick(e) {
  const btn = e.target.closest("button[data-note-id]");
  if (!btn) return;

  const noteId = btn.dataset.noteId;
  const action = btn.dataset.action;

  if (action === "edit") {
    const res = await fetch(`${API_BASE_URL}/api/books/${currentBookId}/notes`);
    const notes = await res.json();
    const note = notes.find((n) => n._id === noteId);
    openNoteModal(true, note);
  }

  if (action === "delete") {
    if (!confirm("Delete this note?")) return;

    await fetch(`${API_BASE_URL}/api/notes/${noteId}`, {
      method: "DELETE",
    });

    refreshNotes();
  }
}

/* ==========================================================
   BOOK EDIT MODAL + SUBMIT
========================================================== */
function openBookEditModal() {
  editBookModal.classList.remove("hidden");
  document.body.classList.add("modal-open");

  editBookTitle.value = currentBook.title;
  editBookAuthor.value = currentBook.author;
  editBookGenres.value = currentBook.genreTags?.join(", ") || "";
  editBookCover.value = currentBook.coverImage;
  editBookDescription.value = currentBook.description;
}

function closeBookEditModal() {
  editBookModal.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

async function handleBookEditSubmit(e) {
  e.preventDefault();

  const payload = {
    title: editBookTitle.value.trim(),
    author: editBookAuthor.value.trim(),
    genreTags: editBookGenres.value
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean),
    coverImage: editBookCover.value.trim(),
    description: editBookDescription.value.trim(),
  };

  await fetch(`${API_BASE_URL}/api/books/${currentBookId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  closeBookEditModal();
  loadBookAndNotes();
}

/* ==========================================================
   INITIALIZATION
========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  // DOM refs
  bookTitleEl = document.getElementById("bookTitle");
  infoBookTitleEl = document.getElementById("infoBookTitle");
  bookAuthorEl = document.getElementById("bookAuthor");
  bookGenresEl = document.getElementById("bookGenres");
  bookDescriptionEl = document.getElementById("bookDescription");
  bookCoverEl = document.getElementById("bookCover");
  notesListEl = document.getElementById("notesList");

  // Note modal refs
  noteModalEl = document.getElementById("noteModal");
  addNoteBtn = document.getElementById("addNoteBtn");
  closeModalBtn = document.getElementById("closeModalBtn");
  noteCancelBtn = document.getElementById("noteCancelBtn");
  noteForm = document.getElementById("noteForm");
  noteFormTitle = document.getElementById("noteFormTitle");
  noteSubmitBtn = document.getElementById("noteSubmitBtn");

  noteTitleInput = document.getElementById("noteTitle");
  noteChapterInput = document.getElementById("noteChapter");
  notePagesInput = document.getElementById("notePages");
  noteDateInput = document.getElementById("noteDate");
  noteThoughtsInput = document.getElementById("noteThoughts");
  noteQuotesInput = document.getElementById("noteQuotes");

  // Rating stars
  ratingStarsEl = document.getElementById("ratingStars");

  // Book edit modal refs
  editBookModal = document.getElementById("editBookModal");
  editBookBtn = document.getElementById("editBookBtn");
  closeBookEditBtn = document.getElementById("closeBookEditBtn");
  cancelBookEditBtn = document.getElementById("cancelBookEditBtn");

  editBookForm = document.getElementById("editBookForm");
  editBookTitle = document.getElementById("editBookTitle");
  editBookAuthor = document.getElementById("editBookAuthor");
  editBookGenres = document.getElementById("editBookGenres");
  editBookCover = document.getElementById("editBookCover");
  editBookDescription = document.getElementById("editBookDescription");

  /* --- Event Listeners --- */

  // Notes modal
  addNoteBtn?.addEventListener("click", () => openNoteModal(false));
  closeModalBtn?.addEventListener("click", closeNoteModal);
  noteCancelBtn?.addEventListener("click", closeNoteModal);
  noteModalEl?.addEventListener("click", (e) => {
    if (e.target === noteModalEl) closeNoteModal();
  });
  noteForm?.addEventListener("submit", handleNoteFormSubmit);

  notesListEl?.addEventListener("click", handleNotesListClick);

  // Book edit modal
  editBookBtn?.addEventListener("click", openBookEditModal);
  closeBookEditBtn?.addEventListener("click", closeBookEditModal);
  cancelBookEditBtn?.addEventListener("click", closeBookEditModal);
  editBookModal?.addEventListener("click", (e) => {
    if (e.target === editBookModal) closeBookEditModal();
  });

  editBookForm?.addEventListener("submit", handleBookEditSubmit);

  // Load main content
  loadBookAndNotes();
});
