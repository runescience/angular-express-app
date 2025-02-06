// addRole.js
const axios = require("axios");

const newRole = {
    role_name: "Admin",
    author: "betty",
    description: "Admin role",
    created_on: new Date(),
    updated_at: new Date(),
    is_active: true,
};


role_id, role_name, description, author, is_active ? 1 : 0

axios
    .post("http://localhost:3000/api/roles", newRole)
    .then((response) => {
        console.log("Role added successfully:", response.data);
    })
    .catch((error) => {
        console.error(
            "Error adding Role:",
            error.response ? error.response.data : error.message,
        );
    });
