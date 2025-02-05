
/**
 * Database Backup Script
 * IMPORTANT: This script must be run from the directory where teams.db resides!
 * Example usage: node backupDb.js
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Print warning message
console.log('\x1b[33m%s\x1b[0m', 'WARNING: This script must be run from the directory where teams.db resides!');
console.log();

// Check if database file exists in current directory
if (!fs.existsSync('teams.db')) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: teams.db not found in current directory');
    process.exit(1);
}

// Create backup directory if it doesn't exist
const backupDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
}

const db = new sqlite3.Database('teams.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        process.exit(1);
    }
    console.log('Connected to database');
});

// Get all tables from the database
const getAllTables = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(tables.map(t => t.name));
        });
    });
};

// Get all records from a table
const getTableData = (tableName) => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
};

async function backupDatabase() {
    try {
        // Create timestamp for backup file
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(backupDir, `backup_${timestamp}.json`);
        
        // Get all tables
        const tables = await getAllTables();
        console.log('Found tables:', tables);

        // Create backup object
        const backup = {};

        // Backup each table
        for (const table of tables) {
            console.log(`Backing up table: ${table}`);
            const data = await getTableData(table);
            backup[table] = data;
            console.log(`✓ Backed up ${data.length} records from ${table}`);
        }

        // Write backup to file
        fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
        console.log(`\nBackup completed successfully!\nBackup saved to: ${backupFile}`);

    } catch (error) {
        console.error('Backup failed:', error);
    } finally {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
            }
            console.log('Database connection closed');
        });
    }
}

// Run the backup
backupDatabase();
