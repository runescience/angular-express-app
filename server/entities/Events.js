const { EntitySchema } = require("typeorm");
const { v4: uuidv4 } = require("uuid");

module.exports = new EntitySchema({
    name: "Event",
    tableName: "events",
    columns: {
        id: {
            primary: true,
            type: "varchar",
            length: 8,
            generated: true,
            default: () => `substring(uuid_generate_v4(), 1, 8)` // Generate UUID
        },
        case_id: {
            type: "varchar",
            nullable: false,
        },
        event_type: {
            type: "varchar",
            length: 50,
            nullable: false,
        },
        old_value: {
            type: "varchar",
            length: 100,
            nullable: true,
        },
        new_value: {
            type: "varchar",
            length: 100,
            nullable: true,
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
                referencedColumnName: "id"
            },
            onDelete: "CASCADE" // Specify cascade delete if needed
        }
    }
});