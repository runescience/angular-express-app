
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

        // Create teams table
        db.run(`
            CREATE TABLE IF NOT EXISTS teams (
                id TEXT PRIMARY KEY,
                teamName TEXT NOT NULL,
                author TEXT NOT NULL,
                created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_on DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_active INTEGER DEFAULT 1
            )
        `);

        // Create roles table
        db.run(`
            CREATE TABLE IF NOT EXISTS roles (
                role_id TEXT PRIMARY KEY,
                role_name TEXT NOT NULL,
                description TEXT,
                created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_active INTEGER DEFAULT 1
            )
        `);

        // Create users table
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                user_id TEXT PRIMARY KEY,
                username TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                is_active INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create user_roles junction table
        db.run(`
            CREATE TABLE IF NOT EXISTS user_roles (
                user_id TEXT NOT NULL,
                role_id TEXT NOT NULL,
                PRIMARY KEY (user_id, role_id),
                FOREIGN KEY (user_id) REFERENCES users (user_id),
                FOREIGN KEY (role_id) REFERENCES roles (role_id)
            )
        `);

        // Create question_types table
        db.run(`
            CREATE TABLE IF NOT EXISTS question_types (
                question_type_id TEXT PRIMARY KEY,
                type TEXT NOT NULL UNIQUE,
                is_active INTEGER DEFAULT 1,
                has_regex INTEGER DEFAULT 0,
                regex_str TEXT,
                has_options INTEGER DEFAULT 0,
                options_str TEXT,
                has_supplemental INTEGER DEFAULT 0,
                supplemental_str TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                author TEXT
            )
        `);

        // Create questions table
        db.run(`
            CREATE TABLE IF NOT EXISTS questions (
                question_id TEXT PRIMARY KEY,
                question_text TEXT NOT NULL,
                question_help TEXT,
                question_type_id TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                author TEXT,
                FOREIGN KEY (question_type_id) REFERENCES question_types (question_type_id)
            )
        `);

        // Create workflow_templates table
        db.run(`
            CREATE TABLE IF NOT EXISTS workflow_templates (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                role_ids TEXT NOT NULL,
                question_ids TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                author TEXT NOT NULL
            )
        `);

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

// Basic route
app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to the API' });
});

// Teams endpoints
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

app.post('/api/teams', (req, res) => {
    const { teamName, author, is_active } = req.body;
    const id = uuidv4().substring(0, 8);

    db.run(
        'INSERT INTO teams (id, teamName, author, is_active) VALUES (?, ?, ?, ?)',
        [id, teamName, author, is_active ? 1 : 0],
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
                is_active,
                created_on: new Date(),
                updated_on: new Date()
            });
        }
    );
});

app.put('/api/teams/:id', (req, res) => {
    const { teamName, author, is_active } = req.body;

    db.run(
        `UPDATE teams 
         SET teamName = ?, author = ?, is_active = ?, updated_on = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [teamName, author, is_active ? 1 : 0, req.params.id],
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
                is_active,
                updated_on: new Date()
            });
        }
    );
});

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

// Question Types endpoints
app.get('/api/question-types', (req, res) => {
    db.all('SELECT * FROM question_types', [], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/question-types/:id', (req, res) => {
    db.get('SELECT * FROM question_types WHERE question_type_id = ?', [req.params.id], (err, row) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Question type not found' });
            return;
        }
        res.json(row);
    });
});

app.post('/api/question-types', (req, res) => {
    const { type, has_regex, regex_str, has_options, options_str, has_supplemental, supplemental_str, author } = req.body;
    const question_type_id = uuidv4().substring(0, 8);

    db.run(
        `INSERT INTO question_types (
            question_type_id, type, has_regex, regex_str, has_options, 
            options_str, has_supplemental, supplemental_str, author
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [question_type_id, type, has_regex, regex_str, has_options, options_str, has_supplemental, supplemental_str, author],
        function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.status(201).json({
                question_type_id,
                type,
                has_regex,
                regex_str,
                has_options,
                options_str,
                has_supplemental,
                supplemental_str,
                author
            });
        }
    );
});

// Questions endpoints
app.get('/api/questions', (req, res) => {
    db.all('SELECT * FROM questions', [], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/questions/:id', (req, res) => {
    db.get('SELECT * FROM questions WHERE question_id = ?', [req.params.id], (err, row) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Question not found' });
            return;
        }
        res.json(row);
    });
});

app.post('/api/questions', (req, res) => {
    const { question_text, question_help, question_type_id, author } = req.body;
    const question_id = uuidv4().substring(0, 8);

    db.run(
        'INSERT INTO questions (question_id, question_text, question_help, question_type_id, author) VALUES (?, ?, ?, ?, ?)',
        [question_id, question_text, question_help, question_type_id, author],
        function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.status(201).json({
                question_id,
                question_text,
                question_help,
                question_type_id,
                author,
                created_at: new Date(),
                updated_at: new Date()
            });
        }
    );
});

// Workflow Templates endpoints
app.get('/api/workflow-templates', (req, res) => {
    db.all('SELECT * FROM workflow_templates', [], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/workflow-templates/:id', (req, res) => {
    db.get('SELECT * FROM workflow_templates WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Workflow template not found' });
            return;
        }
        res.json(row);
    });
});

app.post('/api/workflow-templates', (req, res) => {
    const { title, role_ids, question_ids, author } = req.body;
    const id = uuidv4().substring(0, 8);

    db.run(
        'INSERT INTO workflow_templates (id, title, role_ids, question_ids, author) VALUES (?, ?, ?, ?, ?)',
        [id, title, role_ids, question_ids, author],
        function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.status(201).json({
                id,
                title,
                role_ids,
                question_ids,
                author,
                created_at: new Date(),
                updated_at: new Date()
            });
        }
    );
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
