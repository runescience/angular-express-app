const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "UserRole",
    tableName: "user_roles",
    columns: {
        user_id: {
            primary: true,
            type: "varchar",
            nullable: false,
        },
        role_id: {
            primary: true,
            type: "varchar",
            nullable: false,
        },
    },
    relations: {
        user: {
            target: "User",
            type: "many-to-one",
            joinColumn: {
                name: "user_id",
                referencedColumnName: "user_id",
            },
            onDelete: "CASCADE"
        },
        role: {
            target: "Role",
            type: "many-to-one",
            joinColumn: {
                name: "role_id",
                referencedColumnName: "role_id",
            },
            onDelete: "CASCADE"
        },
    },
});