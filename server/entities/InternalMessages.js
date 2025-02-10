const { EntitySchema } = require("typeorm");
const { v4: uuidv4 } = require("uuid");

module.exports = new EntitySchema({
    name: "InternalMessage",
    tableName: "internal_messages",
    columns: {
        id: {
            primary: true,
            type: "varchar",
            length: 8,
            generated: true,
            default: () => `substring(uuid_generate_v4(), 1, 8)`, // Generate UUID
        },
        to_user_id: {
            type: "varchar",
            nullable: false,
        },
        subject: {
            type: "varchar",
            length: 200,
            nullable: false,
        },
        content: {
            type: "text",
            nullable: false,
        },
        is_read: {
            type: "boolean",
            default: false,
        },
        created_on: {
            type: "timestamp",
            default: () => "CURRENT_TIMESTAMP",
        },
    },
    relations: {
        recipient: {
            target: "User",
            type: "many-to-one",
            joinColumn: {
                name: "to_user_id",
                referencedColumnName: "user_id",
            },
            onDelete: "CASCADE", // Specify cascade delete if needed
        },
    },
});
