const { EntitySchema } = require("typeorm");
const { v4: uuidv4 } = require("uuid");

module.exports = new EntitySchema({
    name: "Team",
    tableName: "teams",
    columns: {
        team_id: {
            primary: true,
            type: "varchar",
            length: 8,
            generated: true,
            default: () => `substring(uuid_generate_v4(), 1, 8)`, // Generate UUID
        },
        team_name: {
            type: "varchar",
            length: 100,
            nullable: false,
        },
        description: {
            type: "text",
            nullable: true,
        },
        contact: {
            type: "varchar",
            length: 100,
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
        is_active: {
            type: "boolean",
            default: true,
        },
    },
    relations: {
        roles: {
            target: "Role",
            type: "many-to-many",
            joinTable: {
                name: "team_roles",
                joinColumn: {
                    name: "team_id",
                    referencedColumnName: "team_id",
                },
                inverseJoinColumn: {
                    name: "role_id",
                    referencedColumnName: "role_id",
                },
            },
        },
    },
});