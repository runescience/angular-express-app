const { EntitySchema } = require("typeorm");
const { v4: uuidv4 } = require("uuid");

module.exports = new EntitySchema({
    name: "Comment",
    tableName: "comments",
    columns: {
        comment_id: {
            primary: true,
            type: "varchar",
            length: 8,
            generated: true,
            default: () => `substring(uuid_generate_v4(), 1, 8)`, // Generate UUID
        },
        content: {
            type: "text",
            nullable: false,
        },
        user_id: {
            type: "varchar",
            nullable: false,
        },
        replying_to_id: {
            type: "varchar",
            nullable: true,
        },
        created_on: {
            type: "timestamp",
            default: () => "CURRENT_TIMESTAMP",
        },
        question_id: {
            type: "varchar",
            nullable: true,
        },
        case_id: {
            type: "varchar",
            nullable: false,
        },
    },
    relations: {
        replies: {
            target: "Comment",
            type: "one-to-many",
            inverseSide: "parent",
            cascade: true,
        },
        parent: {
            target: "Comment",
            type: "many-to-one",
            joinColumn: {
                name: "replying_to_id",
                referencedColumnName: "comment_id",
            },
            nullable: true,
            onDelete: "SET NULL",
        },
    },
});