const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const typeorm = require("typeorm");
const User = require("./entities/User");
const Role = require("./entities/Role");
const setupRoutes = require('./routes');

const app = express();
app.use(cors());
app.use(express.json());

const setupRoutes = require('./routes');  // This imports from routes/index.js

// // Inside your database initialization
// dataSource.initialize()
//     .then(() => {
//         console.log("TypeORM Data Source initialized!");

//         // Set up all routes
//         setupRoutes(app, dataSource, db);

//         // Start server
//         app.listen(3000, () => {
//             console.log("Server is running on port 3000");
//         });
//     })


const dataSource = new typeorm.DataSource({
    type: "sqlite",
    database: "teams.db",
    entities: [User, Role],
    synchronize: true
});

const db = new sqlite3.Database("teams.db", (err) => {
    if (err) {
        console.error("Error connecting to SQLite:", err);
    } else {
        console.log("Connected to SQLite database");

        dataSource.initialize()
            .then(() => {
                console.log("TypeORM Data Source initialized!");

                // Setup all routes
                setupRoutes(app, dataSource, db);

                app.listen(3000, () => {
                    console.log("Server is running on port 3000");
                });
            })
            .catch((err) => {
                console.error("Error during TypeORM initialization:", err);
            });
    }
});
