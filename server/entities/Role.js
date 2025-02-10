const EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
    name: "Role",
    tableName: "roles",
    columns: {
        role_id: {
            primary: true,
            type: "varchar",
            generated: false
        },
        role_name: {
            type: "varchar"
        },
        description: {
            type: "varchar",
            nullable: true
        },
        is_active: {
            type: "boolean",
            default: true
        },
        created_on: {
            type: "datetime",
            createDate: true
        },
        updated_on: {
            type: "datetime",
            updateDate: true
        }
    },
    relations: {
        users: {
            target: "User",
            type: "many-to-many",
            joinTable: {
                name: "user_roles",
                joinColumn: {
                    name: "role_id",
                    referencedColumnName: "role_id"
                },
                inverseJoinColumn: {
                    name: "user_id",
                    referencedColumnName: "user_id"
                }
            }
        }
    }
});
