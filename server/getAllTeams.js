const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

let db;

try {
    const exists = fs.existsSync('teams.db');
    console.log('Does teams.db exist?', exists);

    db = new sqlite3.Database('teams.db', (err) => {
        if (err) {
            console.error('Error connecting to database:', err.message);
            process.exit(1);
        }
        console.log('Connected to database: teams.db');

        // Simple query to get all teams
        const query = `
            SELECT * FROM teams
            ORDER BY created_on DESC
        `;

        // Execute query
        db.all(query, [], (err, teams) => {
            if (err) {
                console.error('Error querying database:', err.message);
                db.close();
                process.exit(1);
            }

            if (teams.length === 0) {
                console.log('No teams found in the database.');
            } else {
                // Display teams on screen
                displayTeams(teams);
                console.log(`\nTotal teams found: ${teams.length}`);

                // Save to JSON file
                saveToJson(teams);
            }

            // Close database connection
            db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err.message);
                    process.exit(1);
                }
                console.log('\nDatabase connection closed.');
                process.exit(0);
            });
        });
    });

} catch (err) {
    console.error('Error checking file:', err);
}

function displayTeams(teams) {
    console.log('\nTeams in teams.db:');
    console.log('=================');
    teams.forEach(team => {
        console.log(`\nTeam ID: ${team.id}`);
        console.log(`Team Name: ${team.teamName}`);
        console.log(`Created By: ${team.author}`);
        console.log(`Created: ${team.created_on}`);
        console.log(`Updated: ${team.updated_on}`);
        console.log(`Status: ${team.is_active ? 'Active' : 'Inactive'}`);
        console.log('-------------------');
    });
}

function saveToJson(teams) {
    // Format the teams data for JSON output
    const teamsData = {
        total_teams: teams.length,
        exported_at: new Date().toISOString(),
        teams: teams.map(team => ({
            id: team.id,
            teamName: team.teamName,
            author: team.author,
            created_on: team.created_on,
            updated_on: team.updated_on,
            is_active: team.is_active === 1 // Convert SQLite integer to boolean
        }))
    };

    // Write to teams.json file
    try {
        fs.writeFileSync(
            'teams.json',
            JSON.stringify(teamsData, null, 2), // Pretty print with 2 spaces
            'utf8'
        );
        console.log('\nTeams data has been saved to teams.json');

        // Display file size
        const stats = fs.statSync('teams.json');
        const fileSizeInKB = (stats.size / 1024).toFixed(2);
        console.log(`File size: ${fileSizeInKB} KB`);
    } catch (err) {
        console.error('Error writing to teams.json:', err);
    }
}
