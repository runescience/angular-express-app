const express = require('express');
const router = express.Router();

module.exports = (dataSource, db) => {
    // TypeORM routes
    // PUT /api/users/:userId (TypeORM version)

    // Internal Messages CRUD endpoints
    app.get("/api/internal-messages", (req, res) => {
        db.all("SELECT * FROM internal_messages", [], (err, rows) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: "Internal server error" });
                return;
            }
            res.json(rows);
        });
    });

    app.get("/api/internal-messages/:id", (req, res) => {
        db.get(
            "SELECT * FROM internal_messages WHERE id = ?",
            [req.params.id],
            (err, row) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: "Internal server error" });
                    return;
                }
                if (!row) {
                    res.status(404).json({ error: "Message not found" });
                    return;
                }
                res.json(row);
            },
        );
    });

    app.post("/api/internal-messages", (req, res) => {
        const { to_user_id, subject, content } = req.body;
        const id = uuidv4().substring(0, 8);

        db.run(
            "INSERT INTO internal_messages (id, to_user_id, subject, content) VALUES (?, ?, ?, ?)",
            [id, to_user_id, subject, content],
            function (err) {
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: "Internal server error" });
                    return;
                }
                res.status(201).json({
                    id,
                    to_user_id,
                    subject,
                    content,
                    is_read: 0,
                    created_on: new Date(),
                });
            },
        );
    });

    app.put("/api/internal-messages/:id/read", (req, res) => {
        db.run(
            "UPDATE internal_messages SET is_read = 1 WHERE id = ?",
            [req.params.id],
            function (err) {
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: "Internal server error" });
                    return;
                }
                if (this.changes === 0) {
                    res.status(404).json({ error: "Message not found" });
                    return;
                }
                res.json({ message: "Message marked as read" });
            },
        );
    });

    app.delete("/api/internal-messages/:id", (req, res) => {
        db.run(
            "DELETE FROM internal_messages WHERE id = ?",
            [req.params.id],
            function (err) {
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: "Internal server error" });
                    return;
                }
                if (this.changes === 0) {
                    res.status(404).json({ error: "Message not found" });
                    return;
                }
                res.status(204).send();
            },
        );
    });


    return router;
};
