const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Serve frontend files (VERY IMPORTANT)
app.use(express.static(path.join(__dirname, "public")));

// Load local JSON files
const booksPath = path.join(__dirname, "books.json");
const studentsPath = path.join(__dirname, "students.json");

// Helper
function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Load Data
let books = JSON.parse(fs.readFileSync(booksPath));
let students = JSON.parse(fs.readFileSync(studentsPath));

//////////////////////////////
//  ROUTES
//////////////////////////////

// Search
app.get("/search", (req, res) => {
  const q = req.query.q?.toLowerCase() || "";

  const results = books.filter(
    (b) =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q)
  );

  res.json(results);
});

// Borrow
app.post("/borrow", (req, res) => {
  const { studentId, bookId } = req.body;

  const book = books.find((b) => b.id === bookId);
  if (!book || !book.available) {
    return res.status(400).json({ message: "Book unavailable" });
  }

  book.available = false;

  const student = students[studentId] || [];
  student.push({
    bookId,
    borrowedAt: Date.now(),
    dueAt: Date.now() + 5 * 24 * 60 * 60 * 1000
  });

  students[studentId] = student;

  writeJSON(booksPath, books);
  writeJSON(studentsPath, students);

  res.json({ message: "Borrowed", dueAt: Date.now() });
});

// Return
app.post("/return", (req, res) => {
  const { studentId, bookId } = req.body;

  const book = books.find((b) => b.id === bookId);
  if (!book) return res.status(404).json({ message: "Book not found" });

  book.available = true;

  students[studentId] = students[studentId]?.filter(
    (b) => b.bookId !== bookId
  ) || [];

  writeJSON(booksPath, books);
  writeJSON(studentsPath, students);

  res.json({ message: "Returned" });
});

// Add Book
app.post("/addBook", (req, res) => {
  const { title, author, category } = req.body;

  const newId = books.length ? books[books.length - 1].id + 1 : 1;

  const newBook = {
    id: newId,
    title,
    author,
    category,
    available: true
  };

  books.push(newBook);
  writeJSON(booksPath, books);

  res.json({ message: "Book added", book: newBook });
});

// Delete
app.post("/deleteBook", (req, res) => {
  const { id } = req.body;
  books = books.filter((b) => b.id !== id);
  writeJSON(booksPath, books);
  res.json({ message: "Book deleted" });
});

// Update availability
app.post("/update", (req, res) => {
  const { id, available } = req.body;

  const book = books.find((b) => b.id === id);
  if (!book) return res.status(404).json({ message: "Book not found" });

  book.available = available;
  writeJSON(booksPath, books);

  res.json({ message: "Book updated" });
});

// Get student data
app.get("/student/:id", (req, res) => {
  const id = req.params.id;
  res.json(students[id] || []);
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on port", PORT));
