const { EntitySchema } = require("typeorm");
const { v4: uuidv4 } = require("uuid");

module.exports = new EntitySchema({
    name: "WorkflowTemplate",
    tableName: "workflow_templates",
    columns: {
        id: {
            primary: true,
            type: "varchar",
            length: 8,
            generated: true,
            default: () => `substring(uuid_generate_v4(), 1, 8)`, // Generate UUID
        },
        title: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        role_ids: {
            type: "text",
            nullable: false,
        },
        question_ids: {
            type: "text",
            nullable: false,
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
        author: {
            type: "varchar",
            nullable: false,
        },
    },
    relations: {}
});