
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create SQLite database connection
const db = new sqlite3.Database('users.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to SQLite database');
        
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

        // Create user_roles junction table for many-to-many relationship
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

        // Create cases table
        db.run(`
            CREATE TABLE IF NOT EXISTS cases (
                id TEXT PRIMARY KEY,
                case_number TEXT UNIQUE NOT NULL,
                workflow_id TEXT NOT NULL,
                current_role_id TEXT NOT NULL,
                current_stage_id TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                modified_by TEXT,
                user_id TEXT,
                author_username TEXT NOT NULL,
                status TEXT DEFAULT 'active',
                FOREIGN KEY (workflow_id) REFERENCES workflow_templates (id),
                FOREIGN KEY (user_id) REFERENCES users (user_id)
            )
        `);

        // Create comments table with self-referential relationship
        db.run(`
            CREATE TABLE IF NOT EXISTS comments (
                comment_id TEXT PRIMARY KEY,
                content TEXT NOT NULL,
                user_id TEXT NOT NULL,
                replying_to_id TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                question_id TEXT,
                case_id TEXT NOT NULL,
                FOREIGN KEY (replying_to_id) REFERENCES comments (comment_id),
                FOREIGN KEY (question_id) REFERENCES questions (question_id),
                FOREIGN KEY (case_id) REFERENCES cases (id)
            )
        `);

        // Create answers table
        db.run(`
            CREATE TABLE IF NOT EXISTS answers (
                id TEXT PRIMARY KEY,
                case_id TEXT,
                case_number TEXT,
                workflow_id TEXT NOT NULL,
                question_id TEXT NOT NULL,
                user_id TEXT,
                answer_text TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (case_id) REFERENCES cases (id),
                FOREIGN KEY (workflow_id) REFERENCES workflow_templates (id),
                FOREIGN KEY (question_id) REFERENCES questions (question_id),
                FOREIGN KEY (user_id) REFERENCES users (user_id)
            )
        `);
    }
});

// Basic route
app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to the Users API' });
});

// Set port and start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
