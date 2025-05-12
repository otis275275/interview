import { Sequelize } from "sequelize";
import path from "path";

// Database configuration
const dbName = process.env.DB_NAME || "database";
const dbUser = process.env.DB_USER || "user";
const dbPassword = process.env.DB_PASSWORD || "password";
const dbHost = process.env.DB_HOST || "localhost";

// Define SQLite database file path
const dbPath = path.join(process.cwd(), "database.sqlite");

// Create and export a proper Sequelize instance
const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  dialect: "sqlite",
  storage: dbPath, // Point to the existing database.sqlite file
  logging: false, // Set to console.log to see SQL queries
});

export default sequelize;
