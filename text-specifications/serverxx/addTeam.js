// addTeam.js

const axios = require("axios");

const newTeam = {
    teamName: "New Team",
    author: "Author Name",
    isActive: true,
};

axios
    .post("http://0.0.0.0:3000/api/teams", newTeam)
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

curl -X POST http://0.0.0.0:3000/api/teams \
-H "Content-Type: application/json" \
-d '{
    "teamName": "New Team",
    "author": "Author Name",
    "isActive": true
}'

****** */
