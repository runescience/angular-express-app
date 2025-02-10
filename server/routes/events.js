const express = require('express');
const router = express.Router();

module.exports = (dataSource, db) => {
    // TypeORM routes
    // PUT /api/users/:userId (TypeORM version)
    // Events CRUD endpoints
    app.get("/api/events", (req, res) => {
        db.all("SELECT * FROM events", [], (err, rows) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: "Internal server error" });
                return;
            }
            res.json(rows);
        });
    });

    app.get("/api/events/:id", (req, res) => {
        db.get("SELECT * FROM events WHERE id = ?", [req.params.id], (err, row) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: "Internal server error" });
                return;
            }
            if (!row) {
                res.status(404).json({ error: "Event not found" });
                return;
            }
            res.json(row);
        });
    });

    app.post("/api/events", (req, res) => {
        const { case_id, event_type, old_value, new_value } = req.body;
        const id = uuidv4().substring(0, 8);

        db.run(
            "INSERT INTO events (id, case_id, event_type, old_value, new_value) VALUES (?, ?, ?, ?, ?)",
            [id, case_id, event_type, old_value, new_value],
            function (err) {
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: "Internal server error" });
                    return;
                }
                res.status(201).json({
                    id,
                    case_id,
                    event_type,
                    old_value,
                    new_value,
                    created_on: new Date(),
                });
            },
        );
    });

    // Update an event by ID
    app.put("/api/events/:id", (req, res) => {
        const { case_id, event_type, old_value, new_value } = req.body;

        db.run(
            `UPDATE events 
         SET case_id = ?, event_type = ?, old_value = ?, new_value = ?, created_on = CURRENT_TIMESTAMP
         WHERE id = ?`,
            [case_id, event_type, old_value, new_value, req.params.id],
            function (err) {
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: "Internal server error" });
                    return;
                }
                if (this.changes === 0) {
                    res.status(404).json({ error: "Event not found" });
                    return;
                }
                res.json({
                    id: req.params.id,
                    case_id,
                    event_type,
                    old_value,
                    new_value,
                    created_on: new Date(),
                });
            },
        );
    });

    // Delete an event by ID
    app.delete("/api/events/:id", (req, res) => {
        db.run("DELETE FROM events WHERE id = ?", [req.params.id], function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: "Internal server error" });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: "Event not found" });
                return;
            }
            res.status(204).send();
        });
    });

    return router;
};
