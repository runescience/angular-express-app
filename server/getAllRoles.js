const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs'); // Add this line - fs was missing

let db; // Declare db variable in wider scope

try {
    const exists = fs.existsSync('teams.db');
    console.log('Does teams.db exist?', exists);

    db = new sqlite3.Database('teams.db', (err) => {
        if (err) {
            console.error('Error connecting to database:', err.message);
            process.exit(1);
        }
        console.log('Connected to database: teams.db');

        // Move the query inside the connection callback
        const query = `
            SELECT 
                r.*,
                COUNT(ur.user_id) as user_count
            FROM roles r
            LEFT JOIN user_roles ur ON r.role_id = ur.role_id
            GROUP BY r.role_id
            ORDER BY r.created_on DESC
        `;

        // Execute query
        db.all(query, [], (err, roles) => {
            if (err) {
                console.error('Error querying database:', err.message);
                db.close();
                process.exit(1);
            }

            if (roles.length === 0) {
                console.log('No roles found in the database.');
            } else {
                displayRoles(roles);
                // Save to JSON file
                saveToJson(roles);
                console.log(`\nTotal roles found: ${roles.length}`);
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

function displayRoles(roles) {
    console.log('\nRoles in teams.db:');
    console.log('=================');
    roles.forEach(role => {
        console.log(`\nRole ID: ${role.role_id}`);
        console.log(`Name: ${role.role_name}`);
        console.log(`Description: ${role.description || 'No description provided'}`);
        console.log(`Author: ${role.author}`);
        console.log(`Created: ${role.created_on}`);
        console.log(`Updated: ${role.updated_on}`);
        console.log(`Status: ${role.is_active ? 'Active' : 'Inactive'}`);
        console.log('-------------------');
    });
}


function saveToJson(roles) {
    // Format the roles data for JSON output
    const rolesData = {
        total_roles: roles.length,
        exported_on: new Date().toISOString(),
        roles: roles.map(role => ({
            role_id: role.role_id,
            role_name: role.role_name,
            description: role.description || null,
            author: role.author,
            created_on: role.created_on,
            updated_on: role.updated_on,
            is_active: role.is_active === 1, // Convert SQLite integer to boolean
            user_count: role.user_count
        }))
    };

    // Write to roles.json file
    try {
        fs.writeFileSync(
            'roles.json',
            JSON.stringify(rolesData, null, 2), // Pretty print with 2 spaces
            'utf8'
        );
        console.log('\nRoles data has been saved to roles.json');
    } catch (err) {
        console.error('Error writing to roles.json:', err);
    }
}
