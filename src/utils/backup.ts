// src/utils/backup.ts
import { AppDataSource } from "../db/config";
import * as fs from 'fs';
import * as path from 'path';

async function backupDatabase() {
    try {
        // Initialize the database connection
        await AppDataSource.initialize();

        // Get all entities registered in DataSource
        const entities = AppDataSource.entityMetadatas;

        // Create backup directory if it doesn't exist
        const backupDir = path.join(__dirname, '../backups', new Date().toISOString().split('T')[0]);
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        // Backup each entity
        for (const entity of entities) {
            console.log(`Backing up ${entity.name}...`);

            // Get the repository
            const repository = AppDataSource.getRepository(entity.name);

            // Fetch all records
            const data = await repository.find({
                relations: entity.relations.map(rel => rel.propertyName)
            });

            // Write to JSON file
            const fileName = path.join(backupDir, `${entity.name}.json`);
            fs.writeFileSync(
                fileName,
                JSON.stringify(data, null, 2)
            );

            console.log(`✓ Backed up ${data.length} records from ${entity.name}`);
        }

        console.log('Backup completed successfully!');

    } catch (error) {
        console.error('Backup failed:', error);
    } finally {
        // Close the database connection
        await AppDataSource.destroy();
    }
}

// Add a restore function as well
async function restoreDatabase(backupDate: string) {
    try {
        // Initialize the database connection
        await AppDataSource.initialize();

        const backupDir = path.join(__dirname, '../backups', backupDate);

        if (!fs.existsSync(backupDir)) {
            throw new Error(`No backup found for date ${backupDate}`);
        }

        // Get all backup files
        const files = fs.readdirSync(backupDir);

        // Restore each file
        for (const file of files) {
            const entityName = path.basename(file, '.json');
            console.log(`Restoring ${entityName}...`);

            // Read backup file
            const data = JSON.parse(
                fs.readFileSync(path.join(backupDir, file), 'utf8')
            );

            // Get the repository
            const repository = AppDataSource.getRepository(entityName);

            // Clear existing data
            await repository.clear();

            // Insert backup data
            if (data.length > 0) {
                await repository.save(data);
            }

            console.log(`✓ Restored ${data.length} records to ${entityName}`);
        }

        console.log('Restore completed successfully!');

    } catch (error) {
        console.error('Restore failed:', error);
    } finally {
        // Close the database connection
        await AppDataSource.destroy();
    }
}

// Add these scripts to package.json
const addScripts = () => {
    console.log(`
Add these scripts to your package.json:

{
  "scripts": {
    "backup": "ts-node src/utils/backup.ts backup",
    "restore": "ts-node src/utils/backup.ts restore"
  }
}
    `);
}

// Handle command line arguments
const command = process.argv[2];
const date = process.argv[3];

if (command === 'backup') {
    backupDatabase();
} else if (command === 'restore' && date) {
    restoreDatabase(date);
} else if (command === 'help' || !command) {
    console.log(`
Usage:
  npm run backup              # Create a new backup
  npm run restore 2023-12-31  # Restore from specific date
    `);
} else {
    console.error('Invalid command or missing date for restore');
}
