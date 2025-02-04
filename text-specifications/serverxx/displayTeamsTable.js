// displayTeamsTable.js

const axios = require("axios");

axios.get('http://0.0.0.0:3000/api/teams')
    .then(response => {
        const teams = response.data;
        if (teams.length === 0) {
            console.log("No teams found.");
            return;
        }

        // Create a table element
        let table = '<table border="1"><thead><tr>';

        // Get the column headers from the first team's keys
        Object.keys(teams[0]).forEach(key => {
            table += `<th>${key}</th>`;
        });
        table += '</tr></thead><tbody>';

        // Add each team as a row in the table
        teams.forEach(team => {
            table += '<tr>';
            Object.values(team).forEach(value => {
                table += `<td>${value}</td>`;
            });
            table += '</tr>';
        });

        table += '</tbody></table>';

        // Output the table to the console (or you can append it to the DOM)
        console.log(table);
    })
    .catch(error => {
        console.error('Error fetching teams:', error.response ? error.response.data : error.message);
    });