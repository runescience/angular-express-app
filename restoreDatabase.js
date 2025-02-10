const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Function to create a table using schema
function createTable(db, tableName, schema) {
    return new Promise((resolve, reject) => {
        const columns = schema.map(col => {
            let definition = `${col.name} ${col.type}`;
            if (col.is_primary_key) definition += ' PRIMARY KEY';
            if (col.notnull) definition += ' NOT NULL';
            if (col.default_value !== null) definition += ` DEFAULT ${col.default_value}`;
            return definition;
        });

        const createTableSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns.join(', ')})`;

        db.run(createTableSQL, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

// Function to insert data into a table
function insertData(db, tableName, data) {
    return new Promise((resolve, reject) => {
        if (data.length === 0) {
            resolve();
            return;
        }

        const columns = Object.keys(data[0]);
        const placeholders = columns.map(() => '?').join(',');
        const sql = `INSERT INTO ${tableName} (${columns.join(',')}) VALUES (${placeholders})`;

        db.serialize(() => {
            // Begin transaction for faster inserts
            db.run('BEGIN TRANSACTION');

            const stmt = db.prepare(sql);

            data.forEach((row) => {
                const values = columns.map(col => row[col]);
                stmt.run(values);
            });

            stmt.finalize();

            db.run('COMMIT', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });
}

async function restoreDatabase(backupFile) {
    try {
        // Read backup file
        console.log(`Reading backup file: ${backupFile}`);
        const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8'));

        // Create new database
        const restoreDbName = 'restored_teams.db';
        console.log(`Creating new database: ${restoreDbName}`);

        // Delete existing database if it exists
        if (fs.existsSync(restoreDbName)) {
            fs.unlinkSync(restoreDbName);
        }

        const db = new sqlite3.Database(restoreDbName);

        // Process each table
        for (const [tableName, tableData] of Object.entries(backup.tables)) {
            console.log(`\nRestoring table: ${tableName}`);

            // Create table
            console.log(`Creating table structure for ${tableName}...`);
            await createTable(db, tableName, tableData.schema);

            // Insert data
            console.log(`Inserting ${tableData.data.length} rows into ${tableName}...`);
            await insertData(db, tableName, tableData.data);

            console.log(`✓ Table ${tableName} restored successfully`);
        }

        // Close database connection
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
            } else {
                console.log('\nRestore completed successfully!');
                console.log(`Database restored to: ${restoreDbName}`);
            }
        });

    } catch (err) {
        console.error('Error during restore:', err);
        process.exit(1);
    }
}

// Check command line arguments
if (process.argv.length < 3) {
    console.log('Usage: node restoreDatabase.js <backup-file.json>');
    process.exit(1);
}

const backupFile = process.argv[2];
if (!fs.existsSync(backupFile)) {
    console.error(`Backup file not found: ${backupFile}`);
    process.exit(1);
}

// Start restore process
restoreDatabase(backupFile);
