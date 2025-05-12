import User from "../models/User";
import sequelize from "../config/database";
import { QueryTypes } from "sequelize";

// Register all models with sequelize
const models = [User];

// Function to check if a table exists
const tableExists = async (tableName: string): Promise<boolean> => {
  try {
    const result = await sequelize.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name = :tableName;",
      {
        replacements: { tableName },
        type: QueryTypes.SELECT,
      }
    );
    return (result as { name: string }[]).length > 0;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
};

export const initializeDatabase = async (forceSync = false) => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");

    // Check if User table exists
    const userTableName = User.getTableName();
    const userTableExists = await tableExists(userTableName as string);

    if (!userTableExists) {
      console.log(
        `User table '${userTableName}' does not exist. Creating it...`
      );
      // Create User table specifically if it doesn't exist
      await User.sync({ force: forceSync });
      console.log(`User table '${userTableName}' created successfully.`);
    } else {
      console.log(`User table '${userTableName}' already exists.`);
    }

    // Explicitly initialize all models to ensure they're registered with sequelize
    models.forEach((model) => {
      if (
        model.initializeTable &&
        typeof model.initializeTable === "function"
      ) {
        // This is optional - only call if you need custom initialization
        // Will be used later when we check the models
      }
    });

    // Print out registered models for debugging
    console.log("Registered models:");
    Object.keys(sequelize.models).forEach((modelName) => {
      console.log(
        `- ${modelName} (table: ${sequelize.models[modelName].getTableName()})`
      );
    });

    // Force sync will drop and recreate all tables - use with caution!
    await sequelize.sync({ force: forceSync, alter: !forceSync });
    console.log(
      `All models were synchronized ${
        forceSync ? "with force" : "successfully"
      }`
    );

    // Verify tables were created
    try {
      const tables = await sequelize.query(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';",
        { type: QueryTypes.SELECT } // Use imported QueryTypes instead
      );
      console.log(
        "Created tables:",
        (tables as { name: string }[]).map((t) => t.name).join(", ")
      );
    } catch (err) {
      console.log("Could not check tables:", err);
    }

    // No longer calling User.initializeTable() separately as it should be handled by sync
    console.log("Database setup complete");
    return true;
  } catch (error) {
    console.error("Unable to set up database:", error);
    throw error;
  }
};

// Automatic initialization if this file is directly executed
if (require.main === module) {
  // For direct execution, use force sync to reset tables (development only)
  const forceReset = process.argv.includes("--force");

  initializeDatabase(forceReset)
    .then(() => {
      console.log(
        `Database initialized successfully${
          forceReset ? " (tables recreated)" : ""
        }`
      );
      process.exit(0);
    })
    .catch((err) => {
      console.error("Failed to initialize database:", err);
      process.exit(1);
    });
}
