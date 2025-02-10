const express = require('express');
const router = express.Router();

module.exports = (dataSource, db) => {

    // GET all teams
    router.get("/api/teams", (req, res) => {
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
    router.get("/api/teams/:id", (req, res) => {
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
    router.post("/api/teams", (req, res) => {
        const { teamName, author, is_active } = req.body;
        const id = generateId()

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
    router.put("/api/teams/:id", (req, res) => {
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
    router.delete("/api/teams/:id", (req, res) => {
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

    // More team routes...

    return router;
};
