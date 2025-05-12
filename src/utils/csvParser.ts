import fs from "fs";
import { parse } from "csv-parse";
import { User } from "../models/database";
import { UniqueConstraintError } from "sequelize";

interface UserData {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  name?: string; // Add name field to interface
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class CsvParser {
  static async parseCsvFile(filePath: string): Promise<UserData[]> {
    return new Promise((resolve, reject) => {
      const results: UserData[] = [];

      fs.createReadStream(filePath)
        .pipe(
          parse({
            columns: true,
            skip_empty_lines: true,
            trim: true,
          })
        )
        .on("data", (data) => results.push(data))
        .on("error", (error) => reject(error))
        .on("end", async () => {
          try {
            // First validate the data structure
            if (results.length > 0 && (!results[0].id || !results[0].email)) {
              return reject(
                new Error("CSV file must have id and email columns")
              );
            }

            resolve(results);
          } catch (error) {
            reject(error);
          }
        });
    });
  }

  static async parseCsvToDatabase(filePath: string): Promise<UserData[]> {
    try {
      // First parse the CSV file
      const userData = await this.parseCsvFile(filePath);

      // Then insert the data into the database
      await User.bulkCreate(
        userData.map((user) => ({
          id: user.id,
          email: user.email,
          // Use existing name if available, otherwise construct it
          name:
            user.name ||
            (user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user.email.split("@")[0].replace(/\./g, " ")),
          // Include all other fields
          phoneNumber: user.phoneNumber,
          address: user.address,
          city: user.city,
          state: user.state,
          zipCode: user.zipCode,
          createdAt: user.createdAt ? new Date(user.createdAt) : undefined,
          updatedAt: user.updatedAt ? new Date(user.updatedAt) : undefined,
        })),
        {
          // Add error handling for unique constraints
          updateOnDuplicate: [
            "email",
            "name",
            "phoneNumber",
            "address",
            "city",
            "state",
            "zipCode",
            "updatedAt",
          ],
          validate: true,
        }
      );

      return userData;
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new Error(`Duplicate entries found in CSV. ${error.message}`);
      }
      throw error;
    }
  }
}
