import { Sequelize, DataTypes, Model } from "sequelize";

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite", // SQLite database file
  logging: false, // Set to console.log for debugging
});

// Define User model
export class User extends Model {
  declare id: string;
  declare email: string;
}

User.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
  },
  {
    sequelize,
    modelName: "User",
    timestamps: false,
  }
);

// Function to initialize the database
export async function initDatabase() {
  try {
    // Sync all models with the database
    // force: true will drop the table if it already exists (use with caution)
    await sequelize.sync();
    console.log("Database synchronized successfully");
    return true;
  } catch (error) {
    console.error("Unable to sync database:", error);
    return false;
  }
}

export default sequelize;
