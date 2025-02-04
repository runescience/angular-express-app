// This script sends a GET request to the '/api/teams' endpoint
// and logs the list of teams retrieved from the server.
// In case of an error, it logs the error message to the console.

// listTeams.js
//curl -X GET http://0.0.0.0:3000/api/teams
//or

const axios = require("axios");

axios.get('http://0.0.0.0:3000/api/teams')
    .then(response => {
        console.log('Teams List:', response.data);
    })
    .catch(error => {
        console.error('Error fetching teams:', error.response ? error.response.data : error.message);
    });
