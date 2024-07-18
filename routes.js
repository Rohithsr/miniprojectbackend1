require('dotenv').config(); // Load environment variables at the top
const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('./db');

const router = express.Router();

// Create a new task
router.post('/tasks', (req, res) => {
    const { title, dueDate, completed } = req.body;
    const sql = 'INSERT INTO tasks (title, due_date, completed) VALUES (?, ?, ?)';
    db.query(sql, [title, dueDate, completed], (err, result) => {
        if (err) {
            console.error('Error creating task:', err);
            return res.status(500).send({ message: 'Error creating task. Please try again.' });
        }
        res.send({ id: result.insertId, ...req.body });
    });
});

// Get all tasks
router.get('/tasks', (req, res) => {
    const sql = 'SELECT * FROM tasks';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching tasks:', err);
            return res.status(500).send({ message: 'Error fetching tasks. Please try again.' });
        }
        res.send(results);
    });
});

// Update a task
router.put('/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    const { title, dueDate, completed } = req.body;
    const sql = 'UPDATE tasks SET title = ?, due_date = ?, completed = ? WHERE id = ?';
    db.query(sql, [title, dueDate, completed, taskId], (err, result) => {
        if (err) {
            console.error('Error updating task:', err);
            return res.status(500).send({ message: 'Error updating task. Please try again.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'Task not found.' });
        }
        res.send({ id: taskId, title, dueDate, completed });
    });
});

// Delete a task
router.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM tasks WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error deleting task:', err);
            return res.status(500).send({ message: 'Error deleting task. Please try again.' });
        }
        res.send({ message: 'Task deleted successfully.' });
    });
});

// Register a new user
router.post('/signup', (req, res) => {
    const { name, email, password } = req.body;
    const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(sql, [name, email, password], (err, result) => {
        if (err) {
            console.error('Error registering user:', err);
            return res.status(500).send({ message: 'Error registering user. Please try again.' });
        }
        res.send({ message: 'User registered successfully!' });
    });
});

// Login a user
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error('Error logging in:', err);
            return res.status(500).send({ message: 'Error logging in. Please try again.' });
        }
        if (results.length === 0) {
            return res.status(401).send({ message: 'User not found!' });
        }
        const user = results[0];
        if (password !== user.password) {
            return res.status(401).send({ message: 'Invalid password!' });
        }
        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });
        res.send({ message: 'Login successful!', token });
    });
});

module.exports = router;
