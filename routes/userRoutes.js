const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

const authenticateToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];
  console.log(token);
  if (!token) return res.status(401).json({ message: 'Access denied. Token not provided.' });

  jwt.verify(token, '1999', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token.' });
    req.user = user;
    next();
  });
};

router.post('/users', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required fields.' });
  }

  const stmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
  stmt.run(name, email, password);
  stmt.finalize();

  res.json({ message: 'User created successfully.' });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, row) => {
    if (!row) return res.status(401).json({ message: 'Invalid email or password.' });

    const token = jwt.sign({ id: row.id,  email: row.email }, '1999', { expiresIn: '2h' });
    res.json({ token });
  });
});

router.get('/users', authenticateToken, (req, res) => {
  const { search } = req.query;
  let query = 'SELECT * FROM users';

  if (search) {
    query += ` WHERE name LIKE '%${search}%' OR email LIKE '%${search}%'`;
  }

  db.all(query, (err, rows) => {
    res.json(rows);
  });
});

router.get('/getUser', authenticateToken, (req, res) => {
  res.json(req.user);
});

module.exports = router;
