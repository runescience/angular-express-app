const { EntitySchema } = require("typeorm");
const { v4: uuidv4 } = require("uuid");

module.exports = new EntitySchema({
    name: "Case",
    tableName: "cases",
    columns: {
        id: {
            primary: true,
            type: "varchar",
            length: 8,
            generated: true,
            default: () => `substring(uuid_generate_v4(), 1, 8)`, // Generate UUID
        },
        case_number: {
            type: "varchar",
            unique: true,
            nullable: false,
            default: () => `substring(uuid_generate_v4(), 1, 8)`, // Generate UUID
        },
        workflow_id: {
            type: "varchar",
            nullable: false,
        },
        current_role_id: {
            type: "varchar",
            nullable: false,
        },
        current_stage_id: {
            type: "varchar",
            nullable: true,
        },
        created_on: {
            type: "timestamp",
            default: () => "CURRENT_TIMESTAMP",
        },
        updated_on: {
            type: "timestamp",
            default: () => "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
        },
        modified_by: {
            type: "varchar",
            length: 100,
            nullable: true,
        },
        assigned_user_id: {
            type: "varchar",
            nullable: true,
        },
        author_username: {
            type: "varchar",
            nullable: false,
        },
        status: {
            type: "varchar",
            length: 20,
            default: "active",
            nullable: true,
        },
    },
    relations: {
        comments: {
            target: "Comment",
            type: "one-to-many",
            inverseSide: "case",
            cascade: true,
        },
        workflow_template: {
            target: "WorkflowTemplate",
            type: "many-to-one",
            joinColumn: {
                name: "workflow_id",
                referencedColumnName: "id",
            },
            onDelete: "CASCADE",
        },
        approval_stage: {
            target: "ApprovalStage",
            type: "many-to-one",
            joinColumn: {
                name: "current_stage_id",
                referencedColumnName: "stage_id",
            },
            onDelete: "SET NULL",
        },
        user: {
            target: "User",
            type: "many-to-one",
            joinColumn: {
                name: "assigned_user_id",
                referencedColumnName: "user_id",
            },
            onDelete: "SET NULL",
        },
    },
});
