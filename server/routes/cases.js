const express = require('express');
const router = express.Router();

module.exports = (dataSource, db) => {

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

    // More team routes...

    return router;
};
