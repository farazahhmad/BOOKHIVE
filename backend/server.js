const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const cors = require('cors');

app.use(cors());
app.use(express.json());

const booksPath = path.join(__dirname, 'books.json');
const studentsPath = path.join(__dirname, 'students.json');

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}
function writeJSON(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

// Load data in memory
let books = readJSON(booksPath);
let students = readJSON(studentsPath);

// ---------- Existing endpoints ----------
app.get('/books', (req, res) => {
  res.json(books);
});

// Add a new book
app.post('/addBook', (req, res) => {
  const { title, author, category } = req.body;

  if (!title || !author || !category) {
    return res.status(400).json({ message: 'All fields required' });
  }

  // Generate new ID
  const newId = books.length > 0 ? books[books.length - 1].id + 1 : 1;

  const newBook = {
    id: newId,
    title,
    author,
    category,
    available: true
  };

  books.push(newBook);
  writeJSON(booksPath, books);

  res.json({ message: 'Book added', book: newBook });
});

// Edit book info
app.post('/editBook', (req, res) => {
  const { id, title, author, category } = req.body;

  const book = books.find(b => b.id === id);
  if (!book) return res.status(404).json({ message: 'Book not found' });

  if (title) book.title = title;
  if (author) book.author = author;
  if (category) book.category = category;

  writeJSON(booksPath, books);

  res.json({ message: 'Book updated', book });
});

// Delete a book
app.post('/deleteBook', (req, res) => {
  const { id } = req.body;

  const index = books.findIndex(b => b.id === id);
  if (index === -1) return res.status(404).json({ message: 'Book not found' });

  books.splice(index, 1);
  writeJSON(booksPath, books);

  res.json({ message: 'Book deleted' });
});


app.get('/search', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const results = books.filter(b =>
    b.title.toLowerCase().includes(q) ||
    b.author.toLowerCase().includes(q)
  );
  res.json(results);
});

// Update availability (used by librarian demo)
app.post('/update', (req, res) => {
  const { id, available } = req.body;
  const b = books.find(x => x.id === id);
  if (!b) return res.status(404).json({ message: 'Book not found' });
  b.available = !!available;
  writeJSON(booksPath, books);
  return res.json({ message: 'Updated!' });
});

// ---------- NEW: Student + borrow/return ----------

// Get student profile + borrowed list
app.get('/student/:id', (req, res) => {
  const s = students.find(x => x.id === req.params.id);
  if (!s) return res.status(404).json({ message: 'Student not found' });
  res.json(s);
});

// Convenience: only borrowed array
app.get('/my-borrows/:id', (req, res) => {
  const s = students.find(x => x.id === req.params.id);
  if (!s) return res.status(404).json({ message: 'Student not found' });
  res.json(s.borrowed || []);
});

// Borrow a book
app.post('/borrow', (req, res) => {
  const { studentId, bookId } = req.body;
  const s = students.find(x => x.id === studentId);
  const b = books.find(x => x.id === bookId);

  if (!s) return res.status(404).json({ message: 'Student not found' });
  if (!b) return res.status(404).json({ message: 'Book not found' });

  if (b.available === false) {
    return res.status(400).json({ message: 'Book already issued' });
  }

  // Optional: simple limit (e.g., 5 active borrows)
  const activeCount = (s.borrowed || []).filter(x => x.status === 'borrowed').length;
  if (activeCount >= 5) {
    return res.status(400).json({ message: 'Borrow limit reached (5)' });
  }

  const now = new Date();
  const due = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days

  // Update book + student
  b.available = false;
  s.borrowed = s.borrowed || [];
  s.borrowed.push({
    bookId: b.id,
    title: b.title,
    author: b.author,
    borrowedAt: now.toISOString(),
    dueAt: due.toISOString(),
    status: 'borrowed'
  });

  writeJSON(booksPath, books);
  writeJSON(studentsPath, students);

  return res.json({ message: 'Book borrowed', dueAt: due.toISOString() });
});

// Return a book
app.post('/return', (req, res) => {
  const { studentId, bookId } = req.body;
  const s = students.find(x => x.id === studentId);
  const b = books.find(x => x.id === bookId);

  if (!s) return res.status(404).json({ message: 'Student not found' });
  if (!b) return res.status(404).json({ message: 'Book not found' });

  const record = (s.borrowed || []).find(x => x.bookId === bookId && x.status === 'borrowed');
  if (!record) {
    return res.status(400).json({ message: 'No active borrow found for this book' });
  }

  // Update
  b.available = true;
  record.status = 'returned';
  record.returnedAt = new Date().toISOString();

  writeJSON(booksPath, books);
  writeJSON(studentsPath, students);

  return res.json({ message: 'Book returned' });
});

app.listen(5000, () => console.log('Server running on port 5000'));
