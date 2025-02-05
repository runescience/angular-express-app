
// server3.js
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create SQLite database connection
const db = new sqlite3.Database('teams.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to SQLite database');

        // Create option_lists table
        db.run(`
            CREATE TABLE IF NOT EXISTS option_lists (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                list_data TEXT,
                version TEXT,
                supercedes TEXT,
                author TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create events table
        db.run(`
            CREATE TABLE IF NOT EXISTS events (
                id TEXT PRIMARY KEY,
                case_id TEXT NOT NULL,
                event_type TEXT NOT NULL,
                old_value TEXT,
                new_value TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (case_id) REFERENCES cases (id)
            )
        `);
    }
});

// Option Lists CRUD endpoints
app.get('/api/option-lists', (req, res) => {
    db.all('SELECT * FROM option_lists', [], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/option-lists/:id', (req, res) => {
    db.get('SELECT * FROM option_lists WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Option list not found' });
            return;
        }
        res.json(row);
    });
});

app.post('/api/option-lists', (req, res) => {
    const { name, list_data, version, supercedes, author } = req.body;
    const id = uuidv4().substring(0, 8);

    db.run(
        'INSERT INTO option_lists (id, name, list_data, version, supercedes, author) VALUES (?, ?, ?, ?, ?, ?)',
        [id, name, list_data, version, supercedes, author],
        function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.status(201).json({
                id,
                name,
                list_data,
                version,
                supercedes,
                author,
                created_at: new Date(),
                updated_at: new Date()
            });
        }
    );
});

app.put('/api/option-lists/:id', (req, res) => {
    const { name, list_data, version, supercedes, author } = req.body;

    db.run(
        `UPDATE option_lists 
         SET name = ?, list_data = ?, version = ?, supercedes = ?, author = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [name, list_data, version, supercedes, author, req.params.id],
        function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: 'Option list not found' });
                return;
            }
            res.json({
                id: req.params.id,
                name,
                list_data,
                version,
                supercedes,
                author,
                updated_at: new Date()
            });
        }
    );
});

app.delete('/api/option-lists/:id', (req, res) => {
    db.run('DELETE FROM option_lists WHERE id = ?', [req.params.id], function (err) {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Option list not found' });
            return;
        }
        res.status(204).send();
    });
});

// Events CRUD endpoints
app.get('/api/events', (req, res) => {
    db.all('SELECT * FROM events', [], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/events/:id', (req, res) => {
    db.get('SELECT * FROM events WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }
        res.json(row);
    });
});

app.post('/api/events', (req, res) => {
    const { case_id, event_type, old_value, new_value } = req.body;
    const id = uuidv4().substring(0, 8);

    db.run(
        'INSERT INTO events (id, case_id, event_type, old_value, new_value) VALUES (?, ?, ?, ?, ?)',
        [id, case_id, event_type, old_value, new_value],
        function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.status(201).json({
                id,
                case_id,
                event_type,
                old_value,
                new_value,
                created_at: new Date()
            });
        }
    );
});

// Set port and start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
