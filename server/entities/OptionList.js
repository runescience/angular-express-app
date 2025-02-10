const { EntitySchema } = require("typeorm");
const { v4: uuidv4 } = require("uuid");

module.exports = new EntitySchema({
    name: "OptionList",
    tableName: "option_lists",
    columns: {
        id: {
            primary: true,
            type: "varchar",
            length: 8,
            generated: true,
            default: () => `substring(uuid_generate_v4(), 1, 8)` // Generate UUID
        },
        name: {
            type: "text",
            nullable: false,
        },
        list_data: {
            type: "text",
            nullable: true,
        },
        version: {
            type: "text",
            nullable: true,
        },
        supercedes: {
            type: "text",
            nullable: true,
        },
        author: {
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
    }
});