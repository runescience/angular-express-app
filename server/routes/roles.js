const express = require('express');
const router = express.Router();

// router.get("/", (req, res) => { ... })  // instead of "/api/roles"
// router.get("/:id", (req, res) => { ... })  // instead of "/api/roles/:id"
// router.post("/", (req, res) => { ... })  // instead of "/api/roles"
// router.put("/:id", (req, res) => { ... })  // instead of "/api/roles/:id"
// router.delete("/:id", (req, res) => { ... })  // instead of "/api/roles/:id"

module.exports = (dataSource, db) => {

    // Endpoint to get all roles /api/roles
    app.get("/", (req, res) => {
        db.all("SELECT * FROM roles", [], (err, rows) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: "Internal server error" });
                return;
            }
            res.json(rows);
        });
    });


    // GET single team  /api/roles
    // Endpoint to get a single role by ID
    app.get("/:id", (req, res) => {
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

    // Endpoint for creating a new role /api/roles
    app.post("/", (req, res) => {
        const { role_name, description, author, is_active } = req.body; // Add author to destructuring
        const role_id = generateId()

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
                    updated_on: new Date(),
                });
            },
        );
    });

    // Endpoint for updating an existing role /api/roles
    app.put("/:id", (req, res) => {
        const { role_name, description, author, is_active } = req.body;

        db.run(
            `UPDATE roles 
         SET role_name = ?, description = ?, author = ?, is_active = ?, updated_on = CURRENT_TIMESTAMP 
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
                    updated_on: new Date(),
                });
            },
        );
    });

    //Endpoint delete roles /api/roles
    app.delete("/:id", (req, res) => {
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

    // More team routes...

    return router;
};
