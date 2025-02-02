// server.js
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

const app = express();

// Middleware
app.use(cors());  // Enable CORS - only need this once
app.use(express.json());  // Parse JSON bodies - only need this once

// Basic route
app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to the Teams API' });
});

// Create SQLite database connection
const db = new sqlite3.Database('teams.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to SQLite database');
        // Create teams table if it doesn't exist
        db.run(`
            CREATE TABLE IF NOT EXISTS teams (
                id TEXT PRIMARY KEY,
                teamName TEXT NOT NULL,
                author TEXT NOT NULL,
                createdOn DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedOn DATETIME DEFAULT CURRENT_TIMESTAMP,
                isActive INTEGER DEFAULT 1
            )
        `);
    }
});

// GET all teams
app.get('/api/teams', (req, res) => {
    db.all('SELECT * FROM teams', [], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(rows);
    });
});

// GET single team
app.get('/api/teams/:id', (req, res) => {
    db.get('SELECT * FROM teams WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Team not found' });
            return;
        }
        res.json(row);
    });
});

// POST new team
app.post('/api/teams', (req, res) => {
    const { teamName, author, isActive } = req.body;
    const id = uuidv4().substring(0, 8);

    db.run(
        'INSERT INTO teams (id, teamName, author, isActive) VALUES (?, ?, ?, ?)',
        [id, teamName, author, isActive ? 1 : 0],
        function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.status(201).json({
                id,
                teamName,
                author,
                isActive,
                createdOn: new Date(),
                updatedOn: new Date()
            });
        }
    );
});

// PUT update team
app.put('/api/teams/:id', (req, res) => {
    const { teamName, author, isActive } = req.body;

    db.run(
        `UPDATE teams 
         SET teamName = ?, author = ?, isActive = ?, updatedOn = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [teamName, author, isActive ? 1 : 0, req.params.id],
        function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: 'Team not found' });
                return;
            }
            res.json({
                id: req.params.id,
                teamName,
                author,
                isActive,
                updatedOn: new Date()
            });
        }
    );
});

// DELETE team
app.delete('/api/teams/:id', (req, res) => {
    db.run('DELETE FROM teams WHERE id = ?', [req.params.id], function (err) {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Team not found' });
            return;
        }
        res.status(204).send();
    });
});

// Set port and start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});