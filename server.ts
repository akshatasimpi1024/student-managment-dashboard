import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// In-memory storage
let students = [
  { id: 1, name: "Arjun Kumar", usn: "1RV20CS001", branch: "Computer Science", semester: "6", photo: "https://picsum.photos/seed/arjun/200" },
  { id: 2, name: "Sneha Rao", usn: "1RV20EC045", branch: "Electronics", semester: "4", photo: "https://picsum.photos/seed/sneha/200" },
  { id: 3, name: "Vikram Singh", usn: "1RV21ME012", branch: "Mechanical", semester: "2", photo: "https://picsum.photos/seed/vikram/200" },
  { id: 4, name: "Priya Sharma", usn: "1RV20IS088", branch: "Information Science", semester: "6", photo: "https://picsum.photos/seed/priya/200" },
  { id: 5, name: "Rahul Verma", usn: "1RV22CV034", branch: "Civil", semester: "1", photo: "https://picsum.photos/seed/rahul/200" },
  { id: 6, name: "Deepa Nair", usn: "1RV20EE022", branch: "Electrical", semester: "8", photo: "https://picsum.photos/seed/deepa/200" }
];

// API Routes
app.get("/api/students", (req, res) => {
  res.json(students);
});

app.post("/api/students", (req, res) => {
  const newStudent = { ...req.body, id: Date.now() };
  students.push(newStudent);
  res.status(201).json(newStudent);
});

app.put("/api/students/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = students.findIndex(s => s.id === id);
  if (index !== -1) {
    students[index] = { ...req.body, id };
    res.json(students[index]);
  } else {
    res.status(404).json({ message: "Student not found" });
  }
});

app.delete("/api/students/:id", (req, res) => {
  const id = parseInt(req.params.id);
  students = students.filter(s => s.id !== id);
  res.status(204).send();
});

// Serve index.html for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
