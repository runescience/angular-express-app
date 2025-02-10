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

        // First, get all table names
        const tableQuery = `
            SELECT name FROM sqlite_master 
            WHERE type='table' 
            AND name NOT LIKE 'sqlite_%'
        `;

        db.all(tableQuery, [], (err, tables) => {
            if (err) {
                console.error('Error getting tables:', err.message);
                db.close();
                process.exit(1);
            }

            if (tables.length === 0) {
                console.log('No tables found in database.');
                db.close();
                process.exit(0);
            }

            const databaseData = {
                database_name: 'teams.db',
                exported_at: new Date().toISOString(),
                tables: {}
            };

            let completedTables = 0;

            // Process each table
            tables.forEach(table => {
                const tableName = table.name;
                console.log(`\nReading table: ${tableName}`);

                // Get all rows from the table
                db.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
                    if (err) {
                        console.error(`Error reading table ${tableName}:`, err.message);
                    } else {
                        console.log(`Found ${rows.length} rows in ${tableName}`);

                        // Get table schema
                        db.all(`PRAGMA table_info(${tableName})`, [], (err, columns) => {
                            if (err) {
                                console.error(`Error getting schema for ${tableName}:`, err.message);
                            } else {
                                databaseData.tables[tableName] = {
                                    schema: columns.map(col => ({
                                        name: col.name,
                                        type: col.type,
                                        notnull: col.notnull === 1,
                                        default_value: col.dflt_value,
                                        is_primary_key: col.pk === 1
                                    })),
                                    row_count: rows.length,
                                    data: rows
                                };
                            }

                            completedTables++;

                            // If all tables are processed, save the file
                            if (completedTables === tables.length) {
                                saveToJson(databaseData);

                                // Close database connection
                                db.close((err) => {
                                    if (err) {
                                        console.error('Error closing database:', err.message);
                                    }
                                    console.log('\nDatabase connection closed.');
                                    process.exit(0);
                                });
                            }
                        });
                    }
                });
            });
        });
    });

} catch (err) {
    console.error('Error checking file:', err);
}

function saveToJson(data) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `database_backup_${timestamp}.json`;

    try {
        // Create backups directory if it doesn't exist
        if (!fs.existsSync('backups')) {
            fs.mkdirSync('backups');
        }

        const filepath = path.join('backups', filename);
        fs.writeFileSync(
            filepath,
            JSON.stringify(data, null, 2),
            'utf8'
        );

        // Calculate file size
        const stats = fs.statSync(filepath);
        const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

        console.log('\nDatabase backup summary:');
        console.log('=======================');
        console.log(`Backup file: ${filename}`);
        console.log(`File size: ${fileSizeInMB} MB`);
        console.log(`Tables backed up: ${Object.keys(data.tables).length}`);
        console.log('\nRows per table:');
        Object.entries(data.tables).forEach(([tableName, tableData]) => {
            console.log(`- ${tableName}: ${tableData.row_count} rows`);
        });
        console.log(`\nBackup saved to: ${filepath}`);

    } catch (err) {
        console.error('Error writing backup file:', err);
    }
}
