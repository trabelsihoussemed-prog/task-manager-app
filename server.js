const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');

const app = express();
const db = new Database('tasks.db');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0
  )
`);

app.get('/api/tasks', (req, res) => {
  const tasks = db.prepare('SELECT * FROM tasks ORDER BY id DESC').all();
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  const info = db.prepare('INSERT INTO tasks (title) VALUES (?)').run(title);
  res.status(201).json({ id: info.lastInsertRowid, title, completed: 0 });
});

app.put('/api/tasks/:id', (req, res) => {
  const { completed } = req.body;
  db.prepare('UPDATE tasks SET completed = ? WHERE id = ?').run(completed ? 1 : 0, req.params.id);
  res.json({ updated: true });
});

app.delete('/api/tasks/:id', (req, res) => {
  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.json({ deleted: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
