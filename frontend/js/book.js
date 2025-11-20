// frontend/js/book.js
// Book detail + chapter notes with modal (add + edit) using MongoDB backend (no login)

const API_BASE_URL = 'http://localhost:4000'; // Change to deployed backend later

// Global-ish state
let currentBook = null;
let currentBookId = null;
let editingNoteId = null;
let currentRating = 0;

// DOM refs
let bookTitleEl,
  bookAuthorEl,
  bookGenresEl,
  bookDescriptionEl,
  bookCoverEl,
  notesListEl,
  noteModalEl,
  addNoteBtn,
  closeModalBtn,
  noteCancelBtn,
  noteForm,
  noteFormTitle,
  noteSubmitBtn,
  noteTitleInput,
  noteChapterInput,
  notePagesInput,
  noteDateInput,
  noteThoughtsInput,
  noteQuotesInput,
  ratingStarsEl;

// Rating utilities
function setRating(value) {
  currentRating = value || 0;
  if (!ratingStarsEl) return;
  const stars = ratingStarsEl.querySelectorAll('.star');
  stars.forEach((s) => {
    const v = Number(s.dataset.value);
    s.classList.toggle('active', v <= currentRating);
  });
}

function initRatingStars() {
  if (!ratingStarsEl) return;
  const stars = ratingStarsEl.querySelectorAll('.star');

  stars.forEach((star) => {
    const val = Number(star.dataset.value);

    star.addEventListener('click', () => setRating(val));

    star.addEventListener('mouseenter', () => {
      stars.forEach((s) => {
        const sVal = Number(s.dataset.value);
        if (sVal <= val) {
          s.classList.add('hovered');
        } else {
          s.classList.remove('hovered');
        }
      });
    });
  });

  ratingStarsEl.addEventListener('mouseleave', () => {
    const stars = ratingStarsEl.querySelectorAll('.star');
    stars.forEach((s) => s.classList.remove('hovered'));
  });
}

// Modal
function openNoteModal(isEdit = false, note = null) {
  document.body.classList.add('modal-open');
  noteModalEl.classList.remove('hidden');
  noteModalEl.setAttribute('aria-hidden', 'false');

  if (isEdit && note) {
    editingNoteId = note._id;
    noteFormTitle.textContent = 'Edit Note';
    noteSubmitBtn.textContent = 'Update Note';

    noteTitleInput.value = note.title || '';
    noteChapterInput.value =
      note.chapter != null && note.chapter !== '' ? note.chapter : '';
    notePagesInput.value = note.pages || '';
    noteDateInput.value = note.dateLogged
      ? note.dateLogged.slice(0, 10)
      : '';
    noteThoughtsInput.value = note.thoughts || '';
    noteQuotesInput.value = (note.favouriteQuotes || []).join('\n');
    setRating(note.rating || 0);
  } else {
    editingNoteId = null;
    noteFormTitle.textContent = 'Add a New Note';
    noteSubmitBtn.textContent = 'Save Note';
    noteForm.reset();
    setRating(0);
  }
}

function closeNoteModal() {
  document.body.classList.remove('modal-open');
  noteModalEl.classList.add('hidden');
  noteModalEl.setAttribute('aria-hidden', 'true');
}

// Notes rendering

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString();
  } catch {
    return dateStr;
  }
}

function renderNotes(notes) {
  if (!notesListEl) return;

  if (!notes.length) {
    notesListEl.innerHTML = '<p>No notes yet. Add your first chapter note.</p>';
    return;
  }

  notesListEl.innerHTML = notes
    .map((note) => {
      const ratingStars = note.rating
        ? '★'.repeat(note.rating) + '☆'.repeat(5 - note.rating)
        : '';
      const chapterText =
        note.chapter != null && note.chapter !== '' ? `Chapter ${note.chapter}` : '';
      const pagesText = note.pages ? ` • Pages ${note.pages}` : '';
      const dateText = note.dateLogged ? ` • ${formatDate(note.dateLogged)}` : '';

      return `
      <article class="note-card">
        <div class="note-card-header">
          <div>
            <div class="note-card-title">${note.title || 'Untitled note'}</div>
            <div class="note-card-meta">
              ${[chapterText, pagesText, dateText].filter(Boolean).join('')}
            </div>
          </div>
          <div class="note-card-rating">${ratingStars}</div>
        </div>
        <p>${note.thoughts || ''}</p>
        ${
          note.favouriteQuotes && note.favouriteQuotes.length
            ? `<p><strong>Favourite quotes:</strong><br>${note.favouriteQuotes
                .map((q) => `“${q}”`)
                .join('<br>')}</p>`
            : ''
        }
        <div class="note-card-actions">
          <button class="btn-secondary" data-note-id="${note._id}" data-action="edit">Edit</button>
          <button class="btn-secondary" data-note-id="${note._id}" data-action="delete">Delete</button>
        </div>
      </article>
    `;
    })
    .join('');
}

// API helpers

async function loadBookAndNotes() {
  const params = new URLSearchParams(window.location.search);
  currentBookId = params.get('id');
  if (!currentBookId) {
    alert('No book id given.');
    window.location.href = 'index.html';
    return;
  }

  try {
    // Book
    const bookRes = await fetch(`${API_BASE_URL}/api/books/${currentBookId}`);
    if (!bookRes.ok) throw new Error('Failed to load book');
    currentBook = await bookRes.json();

    bookTitleEl.textContent = currentBook.title || 'Book Details';
    bookAuthorEl.textContent = currentBook.author || 'Unknown author';
    bookGenresEl.textContent =
      (currentBook.genreTags || []).join(', ') || 'No genre tags set';
    bookDescriptionEl.textContent =
      currentBook.description || 'No description yet.';
    bookCoverEl.src =
      currentBook.coverImage ||
      'https://via.placeholder.com/140x210?text=No+Cover';
    bookCoverEl.alt = currentBook.title || 'Book cover';

    // Notes
    await refreshNotes();
  } catch (err) {
    alert(err.message);
    window.location.href = 'index.html';
  }
}

async function refreshNotes() {
  const res = await fetch(`${API_BASE_URL}/api/books/${currentBookId}/notes`);
  if (!res.ok) {
    notesListEl.innerHTML = '<p>Could not load notes.</p>';
    return;
  }
  const notes = await res.json();
  renderNotes(notes);
}

// Event handlers

async function handleNoteFormSubmit(e) {
  e.preventDefault();
  const title = noteTitleInput.value.trim();
  const chapterRaw = noteChapterInput.value;
  const pages = notePagesInput.value.trim();
  const dateLogged = noteDateInput.value
    ? new Date(noteDateInput.value).toISOString()
    : '';
  const thoughts = noteThoughtsInput.value.trim();
  const quotesRaw = noteQuotesInput.value;

  if (!thoughts) {
    alert('Please add your thoughts.');
    return;
  }

  const chapter =
    chapterRaw !== '' && !isNaN(Number(chapterRaw))
      ? Number(chapterRaw)
      : null;

  const favouriteQuotes = quotesRaw
    ? quotesRaw
        .split('\n')
        .map((q) => q.trim())
        .filter(Boolean)
    : [];

  const payload = {
    title,
    chapter,
    pages,
    dateLogged,
    thoughts,
    favouriteQuotes,
    rating: currentRating,
  };

  try {
    if (editingNoteId) {
      // Update
      const res = await fetch(`${API_BASE_URL}/api/notes/${editingNoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to update note');
      }
    } else {
      // Create new
      const res = await fetch(
        `${API_BASE_URL}/api/books/${currentBookId}/notes`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to create note');
      }
    }

    closeNoteModal();
    await refreshNotes();
  } catch (err) {
    alert(err.message);
  }
}

async function handleNotesListClick(e) {
  const btn = e.target.closest('button[data-note-id]');
  if (!btn) return;

  const noteId = btn.getAttribute('data-note-id');
  const action = btn.getAttribute('data-action');

  if (action === 'edit') {
    // Fetch note details from current DOM list (or could re-fetch from API)
    const res = await fetch(`${API_BASE_URL}/api/books/${currentBookId}/notes`);
    if (!res.ok) return;
    const notes = await res.json();
    const note = notes.find((n) => n._id === noteId);
    if (note) openNoteModal(true, note);
  } else if (action === 'delete') {
    if (!confirm('Delete this note?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/notes/${noteId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to delete note');
      }
      await refreshNotes();
    } catch (err) {
      alert(err.message);
    }
  }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  // Grab DOM elements
  bookTitleEl = document.getElementById('bookTitle');
  bookAuthorEl = document.getElementById('bookAuthor');
  bookGenresEl = document.getElementById('bookGenres');
  bookDescriptionEl = document.getElementById('bookDescription');
  bookCoverEl = document.getElementById('bookCover');
  notesListEl = document.getElementById('notesList');

  noteModalEl = document.getElementById('noteModal');
  addNoteBtn = document.getElementById('addNoteBtn');
  closeModalBtn = document.getElementById('closeModalBtn');
  noteCancelBtn = document.getElementById('noteCancelBtn');
  noteForm = document.getElementById('noteForm');
  noteFormTitle = document.getElementById('noteFormTitle');
  noteSubmitBtn = document.getElementById('noteSubmitBtn');

  noteTitleInput = document.getElementById('noteTitle');
  noteChapterInput = document.getElementById('noteChapter');
  notePagesInput = document.getElementById('notePages');
  noteDateInput = document.getElementById('noteDate');
  noteThoughtsInput = document.getElementById('noteThoughts');
  noteQuotesInput = document.getElementById('noteQuotes');

  ratingStarsEl = document.getElementById('ratingStars');

  if (!bookTitleEl) return; // safety

  // Wire events
  if (addNoteBtn) addNoteBtn.addEventListener('click', () => openNoteModal(false));
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeNoteModal);
  if (noteCancelBtn) noteCancelBtn.addEventListener('click', closeNoteModal);
  if (noteModalEl) {
    noteModalEl.addEventListener('click', (e) => {
      if (e.target === noteModalEl) closeNoteModal();
    });
  }
  if (noteForm) noteForm.addEventListener('submit', handleNoteFormSubmit);
  if (notesListEl) notesListEl.addEventListener('click', handleNotesListClick);

  initRatingStars();
  loadBookAndNotes();
});
