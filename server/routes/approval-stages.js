const express = require('express');
const router = express.Router();

// Import TypeORM entities and dataSource
const { ApprovalStage } = require('@server/entities/ApprovalStage');
const { v4: uuidv4 } = require('uuid');

module.exports = (dataSource, db) => {
    
    // TypeORM routes
    // Approval Stages endpoints

    // GET /api/approval-stages
    // Retrieves all approval stages from the database.
    router.get("/api/approval-stages", async (req, res) => {
        try {
            const approvalStages = await dataSource.getRepository(ApprovalStage).find();
            res.json(approvalStages);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    // GET /api/approval-stages/:id
    // Retrieves a specific approval stage by ID.
    router.get("/api/approval-stages/:id", async (req, res) => {
        try {
            const approvalStage = await dataSource.getRepository(ApprovalStage).findOne({ where: { stage_id: req.params.id } });
            if (!approvalStage) {
                res.status(404).json({ error: "Approval stage not found" });
                return;
            }
            res.json(approvalStage);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    // POST /api/approval-stages
    // Creates a new approval stage in the database.
    router.post("/api/approval-stages", async (req, res) => {
        try {
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
            const approvalStage = dataSource.getRepository(ApprovalStage).create({
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
            await dataSource.getRepository(ApprovalStage).save(approvalStage);
            res.status(201).json(approvalStage);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    // PUT /api/approval-stages/:id
    // Updates an existing approval stage identified by ID.
    router.put("/api/approval-stages/:id", async (req, res) => {
        try {
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

            const approvalStage = await dataSource.getRepository(ApprovalStage).findOne({ where: { stage_id: req.params.id } });
            if (!approvalStage) {
                res.status(404).json({ error: "Approval stage not found" });
                return;
            }

            approvalStage.stage_name = stage_name;
            approvalStage.next_stage_name = next_stage_name;
            approvalStage.last_stage_name = last_stage_name;
            approvalStage.modified_by = modified_by;
            approvalStage.is_first = is_first;
            approvalStage.is_last = is_last;
            approvalStage.order_num = order_num;
            approvalStage.conditions = conditions;
            approvalStage.workflow_template_id = workflow_template_id;
            approvalStage.approve_role_id = approve_role_id;
            approvalStage.deny_role_id = deny_role_id;
            approvalStage.modified_on = new Date();

            await dataSource.getRepository(ApprovalStage).save(approvalStage);
            res.json(approvalStage);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    // DELETE /api/approval-stages/:id
    // Deletes an approval stage from the database using the stage ID.
    router.delete("/api/approval-stages/:id", async (req, res) => {
        try {
            const result = await dataSource.getRepository(ApprovalStage).delete({ stage_id: req.params.id });
            if (result.affected === 0) {
                res.status(404).json({ error: "Approval stage not found" });
                return;
            }
            res.status(204).send();
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    return router;
};