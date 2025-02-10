const { EntitySchema } = require("typeorm");
const { v4: uuidv4 } = require("uuid");

module.exports = new EntitySchema({
    name: "Answer",
    tableName: "answers",
    columns: {
        id: {
            primary: true,
            type: "varchar",
            length: 8,
            generated: true,
            default: () => `substring(uuid_generate_v4(), 1, 8)`, // Generate UUID
        },
        case_id: {
            type: "varchar",
            nullable: true,
        },
        case_number: {
            type: "varchar",
            nullable: true,
        },
        workflow_id: {
            type: "varchar",
            nullable: false,
        },
        question_id: {
            type: "varchar",
            nullable: false,
        },
        user_id: {
            type: "varchar",
            nullable: true,
        },
        answer_text: {
            type: "text",
            nullable: false,
        },
        created_on: {
            type: "timestamp",
            default: () => "CURRENT_TIMESTAMP",
        },
    },
    relations: {
        case: {
            target: "Case",
            type: "many-to-one",
            joinColumn: {
                name: "case_id",
                referencedColumnName: "id",
            },
            nullable: true,
            onDelete: "SET NULL",
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
        question: {
            target: "Question",
            type: "many-to-one",
            joinColumn: {
                name: "question_id",
                referencedColumnName: "question_id",
            },
            onDelete: "CASCADE",
        },
        user: {
            target: "User",
            type: "many-to-one",
            joinColumn: {
                name: "user_id",
                referencedColumnName: "user_id",
            },
            onDelete: "SET NULL",
        },
    },
});