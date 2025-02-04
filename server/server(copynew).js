// server.js
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const { v4: uuidv4 } = require("uuid");

const app = express();

// Middleware
app.use(cors()); // Enable CORS - only need this once
app.use(express.json()); // Parse JSON bodies - only need this once

// Basic route
app.get("/api", (req, res) => {
    res.json({ message: "Welcome to the Teams API" });
});

// Create SQLite database connection
const db = new sqlite3.Database("teams.db", (err) => {
    if (err) {
        console.error("Error connecting to database:", err);
    } else {
        console.log("Connected to SQLite database");
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

        // ==========================
        // Create roles table if it doesn't exist
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

        // ===============================
        // Create option lists table if it doesn't exist
        db.run(`
            CREATE TABLE IF NOT EXISTS list_options (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                list_data TEXT NOT NULL,
                version TEXT,
                supercedes TEXT,
                author TEXT NOT NULL,
                createdOn DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedOn DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_active INTEGER DEFAULT 1
            )
        `);
    }
});

// ========================
// CRUD endpoints
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
    const { teamName, author, isActive } = req.body;
    const id = uuidv4().substring(0, 8);

    db.run(
        "INSERT INTO teams (id, teamName, author, isActive) VALUES (?, ?, ?, ?)",
        [id, teamName, author, isActive ? 1 : 0],
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
                isActive,
                createdOn: new Date(),
                updatedOn: new Date(),
            });
        },
    );
});

// PUT update team
app.put("/api/teams/:id", (req, res) => {
    const { teamName, author, isActive } = req.body;

    db.run(
        `UPDATE teams 
         SET teamName = ?, author = ?, isActive = ?, updatedOn = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [teamName, author, isActive ? 1 : 0, req.params.id],
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
                isActive,
                updatedOn: new Date(),
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
// ======================================
// Endpoint to get all
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
    const { name, list_data, version, supercedes, author } = req.body;
    const id = uuidv4().substring(0, 8);

    db.run(
        "INSERT INTO list_options (id, name, list_data, version, supercedes, author) VALUES (?, ?, ?, ?, ?, ?)",
        [id, name, list_data, version, supercedes, author],
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
                createdOn: new Date(),
                updatedOn: new Date(),
            });
        },
    );
});

app.put("/api/option-lists/:id", (req, res) => {
    const { name, list_data, version, supercedes, author } = req.body;

    db.run(
        `UPDATE list_options 
         SET name = ?, list_data = ?, version = ?, supercedes = ?, author = ?, updatedOn = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [name, list_data, version, supercedes, author, req.params.id],
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
                updatedOn: new Date(),
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

// Set port and start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
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
    const { role_name, description, is_active } = req.body;
    const role_id = uuidv4().substring(0, 8);

    db.run(
        "INSERT INTO roles (role_id, role_name, description, is_active) VALUES (?, ?, ?, ?)",
        [role_id, role_name, description, is_active ? 1 : 0],
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
                is_active,
                created_on: new Date(),
                updated_at: new Date(),
            });
        },
    );
});

// Endpoint for updating an existing role
app.put("/api/roles/:id", (req, res) => {
    const { role_name, description, is_active } = req.body;

    db.run(
        `UPDATE roles 
         SET role_name = ?, description = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE role_id = ?`,
        [role_name, description, is_active ? 1 : 0, req.params.id],
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
                is_active,
                updated_at: new Date(),
            });
        },
    );
});

// Endpoint for deleting a role
app.delete("/api/roles/:id", (req, res) => {
    db.run(
        "DELETE FROM roles WHERE role_id = ?",
        [req.params.id],
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
            res.status(204).send();
        },
    );
});
