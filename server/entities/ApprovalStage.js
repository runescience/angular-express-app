const { EntitySchema } = require("typeorm");
const { v4: uuidv4 } = require("uuid");

module.exports = new EntitySchema({
    name: "ApprovalStage",
    tableName: "approval_stages",
    columns: {
        stage_id: {
            primary: true,
            type: "varchar",
            length: 8,
            generated: true,
            default: () => `substring(uuid_generate_v4(), 1, 8)` // Generate UUID
        },
        stage_name: {
            type: "varchar",
            length: 100,
            nullable: false,
        },
        next_stage_name: {
            type: "varchar",
            length: 100,
            nullable: true,
        },
        last_stage_name: {
            type: "varchar",
            length: 100,
            nullable: true,
        },
        created_on: {
            type: "timestamp",
            default: () => "CURRENT_TIMESTAMP",
        },
        modified_on: {
            type: "timestamp",
            default: () => "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
        },
        author: {
            type: "varchar",
            length: 100,
            nullable: false,
        },
        modified_by: {
            type: "varchar",
            length: 100,
            nullable: true,
        },
        is_first: {
            type: "boolean",
            default: false,
        },
        is_last: {
            type: "boolean",
            default: false,
        },
        order: {
            type: "int",
            nullable: false,
        },
        conditions: {
            type: "varchar",
            nullable: true,
        },
        workflow_template_id: {
            type: "varchar",
            nullable: true,
        },
        approve_role_id: {
            type: "varchar",
            nullable: true,
        },
        deny_role_id: {
            type: "varchar",
            nullable: true,
        },
    },
    relations: {
        workflow_template: {
            target: "WorkflowTemplate",
            type: "many-to-one",
            joinColumn: {
                name: "workflow_template_id",
                referencedColumnName: "id",
            },
            onDelete: "SET NULL"
        },
        approve_role: {
            target: "Role",
            type: "many-to-one",
            joinColumn: {
                name: "approve_role_id",
                referencedColumnName: "role_id",
            },
            onDelete: "SET NULL"
        },
        deny_role: {
            target: "Role",
            type: "many-to-one",
            joinColumn: {
                name: "deny_role_id",
                referencedColumnName: "role_id",
            },
            onDelete: "SET NULL"
        },
    },
});