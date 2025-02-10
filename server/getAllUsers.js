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

        // Query to get users with their roles
        const query = `
            SELECT 
                u.*,
                GROUP_CONCAT(r.role_name) as role_names,
                GROUP_CONCAT(r.role_id) as role_ids
            FROM users u
            LEFT JOIN user_roles ur ON u.user_id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.role_id
            GROUP BY u.user_id
            ORDER BY u.created_on DESC
        `;

        // Execute query
        db.all(query, [], (err, users) => {
            if (err) {
                console.error('Error querying database:', err.message);
                db.close();
                process.exit(1);
            }

            if (users.length === 0) {
                console.log('No users found in the database.');
            } else {
                // Display users on screen
                displayUsers(users);
                console.log(`\nTotal users found: ${users.length}`);

                // Save to JSON file
                saveToJson(users);
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

function displayUsers(users) {
    console.log('\nUsers in teams.db:');
    console.log('=================');
    users.forEach(user => {
        console.log(`\nUser ID: ${user.user_id}`);
        console.log(`Username: ${user.username}`);
        console.log(`Email: ${user.email}`);
        console.log(`Full Name: ${user.full_name || 'Not provided'}`);
        console.log(`Roles: ${user.role_names || 'No roles assigned'}`);
        console.log(`Created: ${user.created_on}`);
        console.log(`Updated: ${user.updated_at}`);
        console.log(`Status: ${user.is_active ? 'Active' : 'Inactive'}`);
        console.log(`Last Login: ${user.last_login || 'Never logged in'}`);
        console.log('-------------------');
    });
}

function saveToJson(users) {
    // Format the users data for JSON output
    const usersData = {
        total_users: users.length,
        exported_at: new Date().toISOString(),
        users: users.map(user => {
            // Convert role_names and role_ids from comma-separated strings to arrays
            const roleNames = user.role_names ? user.role_names.split(',') : [];
            const roleIds = user.role_ids ? user.role_ids.split(',') : [];

            // Combine role IDs and names into objects
            const roles = roleIds.map((id, index) => ({
                role_id: id,
                role_name: roleNames[index]
            }));

            return {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                full_name: user.full_name || null,
                roles: roles,
                created_on: user.created_on,
                updated_at: user.updated_at,
                is_active: user.is_active === 1, // Convert SQLite integer to boolean
                last_login: user.last_login || null
            };
        })
    };

    // Write to users.json file
    try {
        fs.writeFileSync(
            'users.json',
            JSON.stringify(usersData, null, 2), // Pretty print with 2 spaces
            'utf8'
        );
        console.log('\nUsers data has been saved to users.json');

        // Display file size
        const stats = fs.statSync('users.json');
        const fileSizeInKB = (stats.size / 1024).toFixed(2);
        console.log(`File size: ${fileSizeInKB} KB`);
    } catch (err) {
        console.error('Error writing to users.json:', err);
    }
}
