const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// Paths for JSON files
const booksPath = path.join(__dirname, "books.json");
const studentsPath = path.join(__dirname, "students.json");

// Load JSON
let books = JSON.parse(fs.readFileSync(booksPath, "utf8"));
let students = JSON.parse(fs.readFileSync(studentsPath, "utf8"));

// Helper to save
function save(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

/* ================================================================
   SEARCH BOOKS
================================================================ */
app.get("/search", (req, res) => {
  const q = (req.query.q || "").toLowerCase();

  const result = books.filter(
    b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
  );

  res.json(result);
});

/* ================================================================
   BORROW A BOOK — Supports ARRAY students.json
================================================================ */
app.post("/borrow", (req, res) => {
  const { studentId, bookId } = req.body;

  const book = books.find(b => b.id === bookId);
  if (!book) return res.status(404).json({ message: "Book not found" });
  if (!book.available) return res.status(400).json({ message: "Already issued" });

  // Mark book as issued
  book.available = false;

  // Find student object in array
  let student = students.find(s => s.id === studentId);

  // If not found, create new student
  if (!student) {
    student = { id: studentId, name: "", email: "", borrowed: [] };
    students.push(student);
  }

  student.borrowed.push({
    bookId,
    title: book.title,
    author: book.author,
    borrowedAt: new Date().toISOString(),
    dueAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: "borrowed"
  });

  save(booksPath, books);
  save(studentsPath, students);

  res.json({ message: "Borrow success" });
});

/* ================================================================
   RETURN A BOOK — Supports ARRAY students.json
================================================================ */
app.post("/return", (req, res) => {
  const { studentId, bookId } = req.body;

  const book = books.find(b => b.id === bookId);
  if (!book) return res.status(404).json({ message: "Book not found" });

  // Make book available again
  book.available = true;

  // Find the student
  const student = students.find(s => s.id === studentId);
  if (!student) return res.status(404).json({ message: "Student not found" });

  // Find specific borrowed record
  const entry = student.borrowed.find(b => b.bookId === bookId && b.status === "borrowed");
  if (entry) {
    entry.status = "returned";
    entry.returnedAt = new Date().toISOString();
  }

  save(booksPath, books);
  save(studentsPath, students);

  res.json({ message: "Returned" });
});

/* ================================================================
   GET BORROWED BOOKS FOR A STUDENT — ARRAY FORMAT SUPPORTED
================================================================ */
app.get("/student/:id", (req, res) => {
  const studentId = req.params.id;

  const student = students.find(s => s.id === studentId);

  if (!student) return res.json([]); // No books

  res.json(student.borrowed || []);
});

/* ================================================================
   ADD BOOK
================================================================ */
app.post("/addBook", (req, res) => {
  const { title, author, category } = req.body;

  const newBook = {
    id: books.length + 1,
    title,
    author,
    category,
    available: true
  };

  books.push(newBook);
  save(booksPath, books);

  res.json({ message: "Book added", book: newBook });
});

/* ================================================================
   UPDATE BOOK
================================================================ */
app.post("/update", (req, res) => {
  const { id, available } = req.body;

  const book = books.find(b => b.id === id);
  if (!book) return res.status(404).json({ message: "Book not found" });

  book.available = available;

  save(booksPath, books);

  res.json({ message: "Updated" });
});

/* ================================================================
   DELETE BOOK
================================================================ */
app.post("/deleteBook", (req, res) => {
  const { id } = req.body;

  books = books.filter(b => b.id !== id);

  save(booksPath, books);

  res.json({ message: "Book deleted" });
});

/* ================================================================
   START SERVER
================================================================ */
app.listen(5000, () => console.log("Server running on http://localhost:5000"));
