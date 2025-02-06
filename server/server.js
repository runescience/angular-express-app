// server.js
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const app = express();

// // Check if teams.db exists in current directory
// if (!fs.existsSync("teams.db")) {
//     console.log(
//         "\x1b[33m%s\x1b[0m",
//         "WARNING: This script must be run from the directory where teams.db resides!",
//     );
//     process.exit(1);
// }

// Middleware
app.use(cors()); // Enable CORS - only need this once
app.use(express.json()); // Parse JSON bodies - only need this once

// Import cases module
const casesModule = require("./cases");

// Basic route
app.get("/api", (req, res) => {
    res.json({ message: "Welcome to the Teams API" });
});

// Cases endpoints
app.post("/api/cases", async (req, res) => {
    try {
        const result = await casesModule.createCase(req.body);
        res.status(201).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/api/cases/:id", async (req, res) => {
    try {
        const result = await casesModule.getCaseById(req.params.id);
        if (!result) {
            res.status(404).json({ error: "Case not found" });
            return;
        }
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.put("/api/cases/:id", async (req, res) => {
    try {
        const result = await casesModule.updateCase(req.params.id, req.body);
        if (!result) {
            res.status(404).json({ error: "Case not found" });
            return;
        }
        res.json({ message: "Case updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.delete("/api/cases/:id", async (req, res) => {
    try {
        const result = await casesModule.deleteCase(req.params.id);
        if (!result) {
            res.status(404).json({ error: "Case not found" });
            return;
        }
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Create SQLite database connection
const db = new sqlite3.Database("teams.db", (err) => {
    if (err) {
        console.error("Error connecting to database:", err);
    } else {
        //===============
        console.log("Connected to SQLite database");
        // Create teams table if it doesn't exist
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

        // ==========================
        // Create roles table if it doesn't exist
        db.run(`
            CREATE TABLE IF NOT EXISTS roles (
                role_id TEXT PRIMARY KEY,
                role_name TEXT NOT NULL,
                description TEXT,
                author TEXT NOT NULL,
                created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_active INTEGER DEFAULT 1
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

        // Create option lists table if it doesn't exist
        db.run(`
            CREATE TABLE IF NOT EXISTS list_options (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                list_data TEXT NOT NULL,
                version TEXT,
                supercedes TEXT,
                author TEXT NOT NULL,
                created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_on DATETIME DEFAULT CURRENT_TIMESTAMP,
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
                is_active INTEGER DEFAULT 1,
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
                is_active INTEGER DEFAULT 1,
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
                is_active INTEGER DEFAULT 1,
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
                is_active INTEGER DEFAULT 1,

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
                is_active INTEGER DEFAULT 1,

                FOREIGN KEY (case_id) REFERENCES cases (id),
                FOREIGN KEY (workflow_id) REFERENCES workflow_templates (id),
                FOREIGN KEY (question_id) REFERENCES questions (question_id),
                FOREIGN KEY (user_id) REFERENCES users (user_id)
            )
        `);

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
                is_active INTEGER DEFAULT 1,
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
                is_active INTEGER DEFAULT 1,
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
                is_active INTEGER DEFAULT 1,
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

        //========
    }
});

// GET all teams
app.get("/api/teams", (req, res) => {
    db.all("SELECT * FROM teams", [], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Internal server error" });
            return;
        }
        res.json(rows);
    });
});

// GET single team
app.get("/api/teams/:id", (req, res) => {
    db.get("SELECT * FROM teams WHERE id = ?", [req.params.id], (err, row) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Internal server error" });
            return;
        }
        if (!row) {
            res.status(404).json({ error: "Team not found" });
            return;
        }
        res.json(row);
    });
});

// POST new team
app.post("/api/teams", (req, res) => {
    const { teamName, author, is_active } = req.body;
    const id = uuidv4().substring(0, 8);

    db.run(
        "INSERT INTO teams (id, teamName, author, is_active) VALUES (?, ?, ?, ?)",
        [id, teamName, author, is_active ? 1 : 0],
        function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: "Internal server error" });
                return;
            }
            res.status(201).json({
                id,
                teamName,
                author,
                is_active,
                created_on: new Date(),
                updated_on: new Date(),
            });
        },
    );
});

// PUT update team
app.put("/api/teams/:id", (req, res) => {
    const { teamName, author, is_active } = req.body;

    db.run(
        `UPDATE teams 
         SET teamName = ?, author = ?, is_active = ?, updated_on = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [teamName, author, is_active ? 1 : 0, req.params.id],
        function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: "Internal server error" });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: "Team not found" });
                return;
            }
            res.json({
                id: req.params.id,
                teamName,
                author,
                is_active,
                updated_on: new Date(),
            });
        },
    );
});

// DELETE team
app.delete("/api/teams/:id", (req, res) => {
    db.run("DELETE FROM teams WHERE id = ?", [req.params.id], function (err) {
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Internal server error" });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: "Team not found" });
            return;
        }
        res.status(204).send();
    });
});

// Option Lists CRUD endpoints
app.get("/api/option-lists", (req, res) => {
    db.all("SELECT * FROM list_options", [], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Internal server error" });
            return;
        }
        res.json(rows);
    });
});

app.get("/api/option-lists/:id", (req, res) => {
    db.get(
        "SELECT * FROM list_options WHERE id = ?",
        [req.params.id],
        (err, row) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: "Internal server error" });
                return;
            }
            if (!row) {
                res.status(404).json({ error: "Option list not found" });
                return;
            }
            res.json(row);
        },
    );
});

app.post("/api/option-lists", (req, res) => {
    const { name, list_data, version, supercedes, author, is_active } =
        req.body;
    const id = uuidv4().substring(0, 8);

    db.run(
        "INSERT INTO list_options (id, name, list_data, version, supercedes,  author, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [id, name, list_data, version, supercedes, author, is_active],
        function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: "Internal server error" });
                return;
            }
            res.status(201).json({
                id,
                name,
                list_data,
                version,
                supercedes,
                author,
                is_active,
            });
        },
    );
});

app.put("/api/option-lists/:id", (req, res) => {
    const { name, list_data, version, supercedes, author, is_active } =
        req.body;

    db.run(
        `UPDATE list_options 
         SET name = ?, list_data = ?, version = ?, supercedes = ?, author = ?, is_active = ?, updated_on = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [
            name,
            list_data,
            version,
            supercedes,
            author,
            is_active,
            req.params.id,
        ],
        function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: "Internal server error" });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: "Option list not found" });
                return;
            }
            res.json({
                id: req.params.id,
                name,
                list_data,
                version,
                supercedes,
                author,
                is_active,
                updated_on: new Date(),
            });
        },
    );
});

app.delete("/api/option-lists/:id", (req, res) => {
    db.run(
        "DELETE FROM list_options WHERE id = ?",
        [req.params.id],
        function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: "Internal server error" });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: "Option list not found" });
                return;
            }
            res.status(204).send();
        },
    );
});

// ======================================
// Endpoint to get all roles
app.get("/api/roles", (req, res) => {
    db.all("SELECT * FROM roles", [], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Internal server error" });
            return;
        }
        res.json(rows);
    });
});

//Endpoint delete roles
app.delete("/api/roles/:id", (req, res) => {
    const roleId = req.params.id;
    console.log(
        `[${new Date().toISOString()}] DELETE request received for role ID: ${roleId}`,
    );

    // First, get the role details before deletion for logging purposes
    db.get("SELECT * FROM roles WHERE role_id = ?", [roleId], (err, role) => {
        if (err) {
            console.error(
                `[${new Date().toISOString()}] Error fetching role before deletion:`,
                err,
            );
            return res.status(500).json({ error: "Internal server error" });
        }

        // Proceed with deletion
        db.run("DELETE FROM roles WHERE role_id = ?", [roleId], function (err) {
            if (err) {
                console.error(
                    `[${new Date().toISOString()}] Error deleting role ${roleId}:`,
                    err,
                );
                return res.status(500).json({ error: "Internal server error" });
            }

            if (this.changes === 0) {
                console.log(
                    `[${new Date().toISOString()}] No role found with ID: ${roleId}`,
                );
                return res.status(404).json({ error: "Role not found" });
            }

            console.log(
                `[${new Date().toISOString()}] Successfully deleted role:`,
                {
                    roleId,
                    roleDetails: role,
                    changesCount: this.changes,
                },
            );

            res.status(200).json({
                message: "Role deleted successfully",
                deletedRole: role,
            });
        });
    });
});

// Endpoint to get a single role by ID
app.get("/api/roles/:id", (req, res) => {
    db.get(
        "SELECT * FROM roles WHERE role_id = ?",
        [req.params.id],
        (err, row) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: "Internal server error" });
                return;
            }
            if (!row) {
                res.status(404).json({ error: "Role not found" });
                return;
            }
            res.json(row);
        },
    );
});

// Endpoint for creating a new role
app.post("/api/roles", (req, res) => {
    const { role_name, description, author, is_active } = req.body; // Add author to destructuring
    const role_id = uuidv4().substring(0, 8);

    db.run(
        "INSERT INTO roles (role_id, role_name, description, author, is_active) VALUES (?, ?, ?, ?, ?)",
        [role_id, role_name, description, author, is_active ? 1 : 0],
        function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: "Internal server error" });
                return;
            }
            res.status(201).json({
                role_id,
                role_name,
                description,
                author,
                is_active,
                created_on: new Date(),
                updated_at: new Date(),
            });
        },
    );
});

// Endpoint for updating an existing role
app.put("/api/roles/:id", (req, res) => {
    const { role_name, description, author, is_active } = req.body;

    db.run(
        `UPDATE roles 
         SET role_name = ?, description = ?, author = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE role_id = ?`,
        [role_name, description, author, is_active ? 1 : 0, req.params.id],
        function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: "Internal server error" });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: "Role not found" });
                return;
            }
            res.json({
                role_id: req.params.id,
                role_name,
                description,
                author,
                is_active,
                updated_at: new Date(),
            });
        },
    );
});

// Question Types endpoints
app.get("/api/question-types", (req, res) => {
    db.all("SELECT * FROM question_types", [], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Internal server error" });
            return;
        }
        res.json(rows);
    });
});

app.get("/api/question-types/:id", (req, res) => {
    db.get(
        "SELECT * FROM question_types WHERE question_type_id = ?",
        [req.params.id],
        (err, row) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: "Internal server error" });
                return;
            }
            if (!row) {
                res.status(404).json({ error: "Question type not found" });
                return;
            }
            res.json(row);
        }
    );
});

app.post("/api/question-types", (req, res) => {
<<<<<<< HEAD
    const { type, has_regex, regex_str, has_options, options_str, has_supplemental, supplemental_str, author } = req.body;
=======
    const {
        type,
        has_regex,
        regex_str,
        has_options,
        options_str,
        has_supplemental,
        supplemental_str,
        author,
    } = req.body;
>>>>>>> f4483948a9e88fbd90fb9556dd0c77184403b3c3
    const id = uuidv4().substring(0, 8);

    db.run(
        `INSERT INTO question_types (
            question_type_id, type, has_regex, regex_str, has_options, options_str, 
            has_supplemental, supplemental_str, author, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
<<<<<<< HEAD
        [id, type, has_regex, regex_str, has_options, options_str, has_supplemental, supplemental_str, author, true],
=======
        [
            id,
            type,
            has_regex,
            regex_str,
            has_options,
            options_str,
            has_supplemental,
            supplemental_str,
            author,
            true,
        ],
>>>>>>> f4483948a9e88fbd90fb9556dd0c77184403b3c3
        function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: "Internal server error" });
                return;
            }
            res.status(201).json({
                question_type_id: id,
                type,
                has_regex,
                regex_str,
                has_options,
                options_str,
                has_supplemental,
                supplemental_str,
                author,
                is_active: true,
<<<<<<< HEAD
=======
                created_at: new Date(),
                updated_at: new Date(),
            });
        },
    );
});

app.put("/api/question-types/:id", (req, res) => {
    const {
        type,
        has_regex,
        regex_str,
        has_options,
        options_str,
        has_supplemental,
        supplemental_str,
        author,
        is_active,
    } = req.body;

    db.run(
        `UPDATE question_types 
         SET type = ?, has_regex = ?, regex_str = ?, has_options = ?, options_str = ?,
         has_supplemental = ?, supplemental_str = ?, author = ?, is_active = ?,
         updated_at = CURRENT_TIMESTAMP
         WHERE question_type_id = ?`,
        [
            type,
            has_regex,
            regex_str,
            has_options,
            options_str,
            has_supplemental,
            supplemental_str,
            author,
            is_active,
            req.params.id,
        ],
        function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: "Internal server error" });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: "Question type not found" });
                return;
            }
            res.json({
                question_type_id: req.params.id,
                type,
                has_regex,
                regex_str,
                has_options,
                options_str,
                has_supplemental,
                supplemental_str,
                author,
                is_active,
                updated_at: new Date(),
            });
        },
    );
});

app.delete("/api/question-types/:id", (req, res) => {
    db.run(
        "DELETE FROM question_types WHERE question_type_id = ?",
        [req.params.id],
        function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: "Internal server error" });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: "Question type not found" });
                return;
            }
            res.status(204).send();
        },
    );
});

// Questions endpoints
app.get("/api/questions", (req, res) => {
    db.all("SELECT * FROM questions", [], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Internal server error" });
            return;
        }
        res.json(rows);
    });
});

app.get("/api/questions/:id", (req, res) => {
    db.get(
        "SELECT * FROM questions WHERE question_id = ?",
        [req.params.id],
        (err, row) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: "Internal server error" });
                return;
            }
            if (!row) {
                res.status(404).json({ error: "Question not found" });
                return;
            }
            res.json(row);
        },
    );
});

app.post("/api/questions", (req, res) => {
    const { question_text, question_help, question_type_id, author } = req.body;
    const question_id = uuidv4().substring(0, 8);

    db.run(
        "INSERT INTO questions (question_id, question_text, question_help, question_type_id, author) VALUES (?, ?, ?, ?, ?)",
        [question_id, question_text, question_help, question_type_id, author],
        function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: "Internal server error" });
                return;
            }
            res.status(201).json({
                question_id,
                question_text,
                question_help,
                question_type_id,
                author,
>>>>>>> f4483948a9e88fbd90fb9556dd0c77184403b3c3
                created_at: new Date(),
                updated_at: new Date()
            });
        }
    );
});

app.put("/api/question-types/:id", (req, res) => {
    const { type, has_regex, regex_str, has_options, options_str, has_supplemental, supplemental_str, author, is_active } = req.body;

    db.run(
        `UPDATE question_types 
         SET type = ?, has_regex = ?, regex_str = ?, has_options = ?, options_str = ?,
         has_supplemental = ?, supplemental_str = ?, author = ?, is_active = ?,
         updated_at = CURRENT_TIMESTAMP
         WHERE question_type_id = ?`,
        [type, has_regex, regex_str, has_options, options_str, has_supplemental, supplemental_str, author, is_active, req.params.id],
        function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: "Internal server error" });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: "Question type not found" });
                return;
            }
            res.json({
                question_type_id: req.params.id,
                type,
                has_regex,
                regex_str,
                has_options,
                options_str,
                has_supplemental,
                supplemental_str,
                author,
                is_active,
                updated_at: new Date()
            });
        }
    );
});

app.delete("/api/question-types/:id", (req, res) => {
    db.run(
        "DELETE FROM question_types WHERE question_type_id = ?",
        [req.params.id],
        function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: "Internal server error" });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: "Question type not found" });
                return;
            }
            res.status(204).send();
        }
    );
});


// Set port and start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
