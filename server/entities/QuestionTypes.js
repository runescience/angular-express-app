const { EntitySchema } = require("typeorm");
const { v4: uuidv4 } = require("uuid");

module.exports = new EntitySchema({
    name: "QuestionType",
    tableName: "question_types",
    columns: {
        question_type_id: {
            primary: true,
            type: "varchar",
            length: 8,
            generated: true,
            default: () => `substring(uuid_generate_v4(), 1, 8)`, // Generate UUID
        },
        type: {
            type: "varchar",
            unique: true,
            nullable: false,
        },
        is_active: {
            type: "boolean",
            default: true,
        },
        has_regex: {
            type: "boolean",
            default: false,
        },
        regex_str: {
            type: "varchar",
            nullable: true,
        },
        has_options: {
            type: "boolean",
            default: false,
        },
        options_str: {
            type: "varchar",
            nullable: true,
        },
        has_supplemental: {
            type: "boolean",
            default: false,
        },
        supplemental_str: {
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
        author: {
            type: "varchar",
            nullable: true,
        },
    },
    relations: {
        questions: {
            target: "Question",
            type: "one-to-many",
            inverseSide: "question_type",
            cascade: true,
        },
    },
});
