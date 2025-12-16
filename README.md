BookHive

BookHive is a simple college library web application designed for students and librarians of NIT Jamshedpur.
It allows students to search and borrow books online, while librarians can manage the library inventory.

This project is built as a demonstration library portal using basic frontend and backend technologies.

🚀 Features
👨‍🎓 Student Features

Search books by title or author

Check book availability

Borrow books online

View borrowed books and due dates

Return borrowed books

🧑‍🏫 Librarian Features

Secure librarian login

Add new books to the library

Update book availability

Delete books from inventory

Manage library data easily

🖥️ Tech Stack Used
Frontend

HTML

CSS (custom styling with modern UI)

JavaScript

Backend

Node.js

Express.js

Database (for demo)

books.json → stores book details

students.json → stores student borrowing data

Note: JSON files are used as a lightweight database for college project purposes.

⚙️ How the System Works (Simple Explanation)

The frontend (website) sends requests when a user searches, borrows, or returns a book.

The backend server receives these requests.

The backend reads and updates data stored in JSON files.

The updated result is sent back to the frontend and shown to the user.

▶️ How to Run the Project

Install Node.js

Open the project folder in terminal

Install dependencies:

npm install


Start the server:

node server.js


Open your browser and go to:

http://localhost:5000

🔑 Demo Login Credentials
Librarian Login

Email: admin@library.com

Password: admin123

Student Login

Demo student is stored in students.json

📁 Project Structure
BookHive/
│
├── index.html
├── student-login.html
├── librarian-login.html
├── student-dashboard.html
├── librarian-dashboard.html
├── about.html
│
├── styles.css
├── server.js
│
├── books.json
├── students.json
└── libimg.jpg

📌 Future Improvements

Use a real database like MySQL or MongoDB

Add authentication with passwords for students

Add book reservation feature

Add fine calculation for late returns

Improve recommendation system

👨‍💻 Developed By

Faraz Ahmed
