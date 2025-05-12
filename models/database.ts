import { Sequelize, DataTypes, Model } from "sequelize";
// Import sqlite3 properly for use in Next.js environment
import sqlite3 from 'sqlite3';

// Initialize Sequelize with SQLite and explicitly specify dialect
// This prevents loading of other dialect modules (like Postgres)
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite",
  // Fixed: logging set to a function instead of a string
  logging: console.log,
  dialectModule: sqlite3, // Using the properly imported module
  dialectOptions: {
    // Explicitly prevent loading other dialect-specific modules
    supportBigNumbers: true,
  },
});

// Define User model
class User extends Model {
  declare id: number;
  declare name: string;
  declare email: string;
  declare age: number;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      // Error: unique constraint without validation
      unique: true,
    },
    // Fixed: age defined as integer instead of string
    age: {
      type: DataTypes.INTEGER, // Changed from STRING to INTEGER
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "User",
    // Fixed: timestamps set to boolean false instead of string
    timestamps: false, // Changed from "false" to false
  }
);

// Fixed: added async/await to handle database sync properly
const initDatabase = async () => {
  await sequelize.sync();
};

export { sequelize, User, initDatabase };
