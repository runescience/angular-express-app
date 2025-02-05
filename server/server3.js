
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

        // Create approval_stages table
        db.run(`
            CREATE TABLE IF NOT EXISTS approval_stages (
                stage_id TEXT PRIMARY KEY,
                stage_name TEXT NOT NULL,
                next_stage_name TEXT,
                last_stage_name TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                modified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                author TEXT NOT NULL,
                modified_by TEXT,
                is_first INTEGER DEFAULT 0,
                is_last INTEGER DEFAULT 0,
                order_num INTEGER NOT NULL,
                conditions TEXT,
                workflow_template_id TEXT,
                approve_role_id TEXT,
                deny_role_id TEXT,
                FOREIGN KEY (workflow_template_id) REFERENCES workflow_templates (id),
                FOREIGN KEY (approve_role_id) REFERENCES roles (role_id),
                FOREIGN KEY (deny_role_id) REFERENCES roles (role_id)
            )
        `);

        // Create internal_messages table
        db.run(`
            CREATE TABLE IF NOT EXISTS internal_messages (
                id TEXT PRIMARY KEY,
                to_user_id TEXT NOT NULL,
                subject TEXT NOT NULL,
                content TEXT NOT NULL,
                is_read INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (to_user_id) REFERENCES users (user_id)
            )
        `);

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

// Internal Messages CRUD endpoints
app.get('/api/internal-messages', (req, res) => {
    db.all('SELECT * FROM internal_messages', [], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/internal-messages/:id', (req, res) => {
    db.get('SELECT * FROM internal_messages WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Message not found' });
            return;
        }
        res.json(row);
    });
});

app.get('/api/users/:userId/messages', (req, res) => {
    db.all('SELECT * FROM internal_messages WHERE to_user_id = ?', [req.params.userId], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/internal-messages', (req, res) => {
    const { to_user_id, subject, content } = req.body;
    const id = uuidv4().substring(0, 8);

    db.run(
        'INSERT INTO internal_messages (id, to_user_id, subject, content) VALUES (?, ?, ?, ?)',
        [id, to_user_id, subject, content],
        function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.status(201).json({
                id,
                to_user_id,
                subject,
                content,
                is_read: 0,
                created_at: new Date()
            });
        }
    );
});

app.put('/api/internal-messages/:id/read', (req, res) => {
    db.run(
        'UPDATE internal_messages SET is_read = 1 WHERE id = ?',
        [req.params.id],
        function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: 'Message not found' });
                return;
            }
            res.json({ message: 'Message marked as read' });
        }
    );
});

app.delete('/api/internal-messages/:id', (req, res) => {
    db.run('DELETE FROM internal_messages WHERE id = ?', [req.params.id], function (err) {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Message not found' });
            return;
        }
        res.status(204).send();
    });
});

// Approval Stages endpoints
app.get('/api/approval-stages', (req, res) => {
    db.all('SELECT * FROM approval_stages', [], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/approval-stages/:id', (req, res) => {
    db.get('SELECT * FROM approval_stages WHERE stage_id = ?', [req.params.id], (err, row) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Approval stage not found' });
            return;
        }
        res.json(row);
    });
});

app.post('/api/approval-stages', (req, res) => {
    const { stage_name, next_stage_name, last_stage_name, author, modified_by, is_first, is_last, 
            order_num, conditions, workflow_template_id, approve_role_id, deny_role_id } = req.body;
    const stage_id = uuidv4().substring(0, 8);

    db.run(
        `INSERT INTO approval_stages (
            stage_id, stage_name, next_stage_name, last_stage_name, author, modified_by,
            is_first, is_last, order_num, conditions, workflow_template_id, approve_role_id, deny_role_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [stage_id, stage_name, next_stage_name, last_stage_name, author, modified_by, 
         is_first ? 1 : 0, is_last ? 1 : 0, order_num, conditions, workflow_template_id, 
         approve_role_id, deny_role_id],
        function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.status(201).json({
                stage_id,
                stage_name,
                next_stage_name,
                last_stage_name,
                author,
                modified_by,
                is_first,
                is_last,
                order_num,
                conditions,
                workflow_template_id,
                approve_role_id,
                deny_role_id,
                created_at: new Date(),
                modified_at: new Date()
            });
        }
    );
});

app.put('/api/approval-stages/:id', (req, res) => {
    const { stage_name, next_stage_name, last_stage_name, modified_by, is_first, is_last,
            order_num, conditions, workflow_template_id, approve_role_id, deny_role_id } = req.body;

    db.run(
        `UPDATE approval_stages 
         SET stage_name = ?, next_stage_name = ?, last_stage_name = ?, modified_by = ?,
             is_first = ?, is_last = ?, order_num = ?, conditions = ?, workflow_template_id = ?,
             approve_role_id = ?, deny_role_id = ?, modified_at = CURRENT_TIMESTAMP
         WHERE stage_id = ?`,
        [stage_name, next_stage_name, last_stage_name, modified_by, is_first ? 1 : 0, is_last ? 1 : 0,
         order_num, conditions, workflow_template_id, approve_role_id, deny_role_id, req.params.id],
        function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: 'Approval stage not found' });
                return;
            }
            res.json({
                stage_id: req.params.id,
                stage_name,
                next_stage_name,
                last_stage_name,
                modified_by,
                is_first,
                is_last,
                order_num,
                conditions,
                workflow_template_id,
                approve_role_id,
                deny_role_id,
                modified_at: new Date()
            });
        }
    );
});

app.delete('/api/approval-stages/:id', (req, res) => {
    db.run('DELETE FROM approval_stages WHERE stage_id = ?', [req.params.id], function (err) {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Approval stage not found' });
            return;
        }
        res.status(204).send();
    });
});

// Set port and start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
