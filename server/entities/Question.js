const { EntitySchema } = require("typeorm");
const { v4: uuidv4 } = require("uuid");

module.exports = new EntitySchema({
    name: "Question",
    tableName: "questions",
    columns: {
        question_id: {
            primary: true,
            type: "varchar",
            length: 8,
            generated: true,
            default: () => `substring(uuid_generate_v4(), 1, 8)`, // Generate UUID
        },
        question_text: {
            type: "text",
            nullable: false,
        },
        question_help: {
            type: "text",
            nullable: true,
        },
        question_type_id: {
            type: "varchar",
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
        is_active: {
            type: "boolean",
            default: true,
        },
    }
});