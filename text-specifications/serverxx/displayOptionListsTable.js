// displayOptionListsTable.js

const axios = require("axios");

axios
    .get("http://0.0.0.0:3000/api/option-lists")
    .then((response) => {
        const optionLists = response.data;
        if (optionLists.length === 0) {
            console.log("No option lists found.");
            return;
        }

        // Create a table element
        let table =
            '<table border="1" style="border-collapse: collapse; width: 100%;">';
        table += '<thead style="background-color: #f2f2f2;"><tr>';

        // Get the column headers from the first option list's keys
        Object.keys(optionLists[0]).forEach((key) => {
            table += `<th style="padding: 8px; border: 1px solid #ddd;">${key}</th>`;
        });
        table += "</tr></thead><tbody>";

        // Add each option list as a row in the table
        optionLists.forEach((list) => {
            table += "<tr>";
            Object.values(list).forEach((value) => {
                table += `<td style="padding: 8px; border: 1px solid #ddd;">${value}</td>`;
            });
            table += "</tr>";
        });

        table += "</tbody></table>";

        // Output the table to the console, formatted for readability
        console.log(table);
    })
    .catch((error) => {
        console.error(
            "Error fetching option lists:",
            error.response ? error.response.data : error.message,
        );
    });
