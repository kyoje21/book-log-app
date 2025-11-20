# Book Log App (MongoDB, No Auth)

A simple full-stack book journal:

- Frontend: plain HTML/CSS/JS (no login/register)
- Backend: Node + Express + MongoDB (Mongoose)
- Data: Books + chapter notes stored in MongoDB
- UX: Add/edit notes in a **modal popup** with background blur

## 1. Backend setup (MongoDB)

1. Go to the `backend` folder:

```bash
cd backend
npm install
```

2. Create a `.env` file in `backend/` based on `.env.example`:

```bash
cp .env.example .env
```

3. Edit `.env` and set your `MONGO_URI` (e.g., from MongoDB Atlas).

4. Run the backend:

```bash
npm run dev
```

This starts the server on `http://localhost:4000`.

## 2. Frontend (local dev)

From a second terminal:

```bash
cd frontend
python3 -m http.server 3000
```

Then open:

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api/books, etc.

The frontend talks to the backend at `http://localhost:4000`.  
Later, for deployment (e.g., Vercel), you can change the `API_BASE_URL` in the JS files.

Files to update when deploying:

- `frontend/js/index.js`
- `frontend/js/add-book.js`
- `frontend/js/book.js`

Change:

```js
const API_BASE_URL = 'http://localhost:4000';
```

to your hosted backend URL.
