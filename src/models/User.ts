import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

// Interface for User attributes
interface UserAttributes {
  id: number;
  name: string;
  email: string;
  age?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class User
  extends Model<
    UserAttributes,
    Optional<UserAttributes, "id" | "createdAt" | "updatedAt">
  >
  implements UserAttributes
{
  public id!: number;
  public name!: string;
  public email!: string;
  public age?: number;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Static method to sync the model with the database
  static async initializeTable() {
    await User.sync();
    console.log("User table initialized");
  }
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
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "Users",
    timestamps: true,
  }
);

// Add a test connection method
export const testDatabaseConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully");
    return true;
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    return false;
  }
};

export default User;
