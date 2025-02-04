// backup.js
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbFile = path.join(__dirname, 'teams.db');
const backupFile = path.join(__dirname, `backup_teams_${new Date().toISOString().slice(0, 10)}.json`);

const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
});

// Fetch teams data
db.all('SELECT * FROM teams', [], (err, rows) => {
    if (err) {
        console.error('Error fetching data:', err);
        db.close();
        return;
    }

    // Write to JSON file
    fs.writeFile(backupFile, JSON.stringify(rows, null, 2), (err) => {
        if (err) {
            console.error('Error writing to JSON file:', err);
        } else {
            console.log('Database backed up successfully to:', backupFile);
        }
        db.close();
    });
});