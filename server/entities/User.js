const EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
    name: "User",
    tableName: "users",
    columns: {
        user_id: {
            primary: true,
            type: "varchar"
        },
        username: {
            type: "varchar"
        },
        email: {
            type: "varchar",
            unique: true
        },
        password_hash: {
            type: "varchar"
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
        roles: {
            target: "Role",
            type: "many-to-many",
            joinTable: {
                name: "user_roles",
                joinColumn: {
                    name: "user_id",
                    referencedColumnName: "user_id"
                },
                inverseJoinColumn: {
                    name: "role_id",
                    referencedColumnName: "role_id"
                }
            }
        }
    }
});
