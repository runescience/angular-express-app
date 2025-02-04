import { DataSource } from "typeorm";
import { Team } from "../entities/Team";
// Import other entities you have here

export const AppDataSource = new DataSource({
    type: "sqlite", // or your database type (mysql, postgres, etc)
    database: "database.sqlite", // your database name
    entities: [
        Team, // add your entities here
        // Other entities...
    ],
    synchronize: false, // set to false in production
    logging: false,
    migrations: ["src/migrations/*.ts"],
});

export const initializeDB = async () => {
    try {
        await AppDataSource.initialize();
        console.log("Database connection initialized");
    } catch (error) {
        console.error("Error initializing database:", error);
        throw error;
    }
};
