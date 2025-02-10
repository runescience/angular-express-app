const express = require('express');
const router = express.Router();

module.exports = (dataSource, db) => {
    
    // TypeORM routes
    // PUT /api/users/:userId (TypeORM version)
    
    // ===

    // Approval Stages endpoints

    // GET /api/approval-stages
    // Retrieves all approval stages from the database.
    app.get("/api/approval-stages", (req, res) => {
        db.all("SELECT * FROM approval_stages", [], (err, rows) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: "Internal server error" });
                return;
            }
            res.json(rows);
        });
    });

    // GET /api/approval-stages/:id
    // Retrieves a specific approval stage by ID.
    app.get("/api/approval-stages/:id", (req, res) => {
        db.get(
            "SELECT * FROM approval_stages WHERE stage_id = ?",
            [req.params.id],
            (err, row) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: "Internal server error" });
                    return;
                }
                if (!row) {
                    res.status(404).json({ error: "Approval stage not found" });
                    return;
                }
                res.json(row);
            },
        );
    });

    // POST /api/approval-stages
    // Creates a new approval stage in the database.
    app.post("/api/approval-stages", (req, res) => {
        const {
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
        } = req.body;
        const stage_id = uuidv4().substring(0, 8);

        db.run(
            `INSERT INTO approval_stages (
                stage_id, stage_name, next_stage_name, last_stage_name, author, modified_by,
                is_first, is_last, order_num, conditions, workflow_template_id, approve_role_id, deny_role_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
            [
                stage_id,
                stage_name,
                next_stage_name,
                last_stage_name,
                author,
                modified_by,
                is_first ? 1 : 0,
                is_last ? 1 : 0,
                order_num,
                conditions,
                workflow_template_id,
                approve_role_id,
                deny_role_id,
            ],
            function (err) {
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: "Internal server error" });
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
                    created_on: new Date(),
                    modified_on: new Date(),
                });
            },
        );
    });

    // PUT /api/approval-stages/:id
    // Updates an existing approval stage identified by ID.
    app.put("/api/approval-stages/:id", (req, res) => {
        const {
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
        } = req.body;

        db.run(
            `UPDATE approval_stages 
             SET stage_name = ?, next_stage_name = ?, last_stage_name = ?, modified_by = ?,
                 is_first = ?, is_last = ?, order_num = ?, conditions = ?, workflow_template_id = ?,
                 approve_role_id = ?, deny_role_id = ?, modified_on = CURRENT_TIMESTAMP
             WHERE stage_id = ?`,
            [
                stage_name,
                next_stage_name,
                last_stage_name,
                modified_by,
                is_first ? 1 : 0,
                is_last ? 1 : 0,
                order_num,
                conditions,
                workflow_template_id,
                approve_role_id,
                deny_role_id,
                req.params.id,
            ],
            function (err) {
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: "Internal server error" });
                    return;
                }
                if (this.changes === 0) {
                    res.status(404).json({ error: "Approval stage not found" });
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
                    modified_on: new Date(),
                });
            },
        );
    });

    // DELETE /api/approval-stages/:id
    // Deletes an approval stage from the database using the stage ID.
    app.delete("/api/approval-stages/:id", (req, res) => {
        db.run(
            "DELETE FROM approval_stages WHERE stage_id = ?",
            [req.params.id],
            function (err) {
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: "Internal server error" });
                    return;
                }
                if (this.changes === 0) {
                    res.status(404).json({ error: "Approval stage not found" });
                    return;
                }
                res.status(204).send();
            },
        );
    });



    
    // ===


    
    return router;
};
