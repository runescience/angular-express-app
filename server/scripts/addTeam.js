// addTeam.js

const axios = require("axios");

const newTeam = {
    teamName: "New Green3",
    author: "Author Name3",
    is_active: true,
};

axios
    .post("http://localhost:3000/api/teams", newTeam)
    .then((response) => {
        console.log("Team added successfully:", response.data);
    })
    .catch((error) => {
        console.error(
            "Error adding team:",
            error.response ? error.response.data : error.message,
        );
    });

/* ************************

curl -X POST http://localhost:3000/api/teams \
-H "Content-Type: application/json" \
-d '{
    "teamName": "New Team",
    "author": "Author Name",
    "is_active": true
}'

****** */
