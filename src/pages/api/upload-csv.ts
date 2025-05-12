import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import { CsvParser } from "../../utils/csvParser";
import { initDatabase } from "../../models/database";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Initialize database and ensure tables are synced before processing
    try {
      await initDatabase();
      console.log("Database initialized successfully");
    } catch (dbError) {
      console.error("Database initialization error:", dbError);
      return res.status(500).json({
        error: "Database initialization failed",
        details: dbError instanceof Error ? dbError.message : "Unknown error",
      });
    }

    const form = formidable({
      // Allow empty files to prevent the error
      allowEmptyFiles: true,
      // Set a reasonable file size limit
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    const [, files] = await new Promise<[formidable.Fields, formidable.Files]>(
      (resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          resolve([fields, files]);
        });
      }
    );

    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    // Check if file exists and has content
    if (!file || Array.isArray(file) || file.size === 0) {
      return res
        .status(400)
        .json({ error: "Please upload a non-empty CSV file" });
    }

    // Process the CSV file
    try {
      const results = await CsvParser.parseCsvToDatabase(file.filepath);

      // Cleanup: remove temp file after processing
      fs.unlinkSync(file.filepath);

      return res.status(200).json({
        message: "File uploaded successfully",
        recordsProcessed: results.length,
      });
    } catch (csvError) {
      console.error("CSV processing error:", csvError);

      // Provide more detailed error information when there's a database-related error
      if (
        csvError instanceof Error &&
        csvError.name === "SequelizeDatabaseError"
      ) {
        return res.status(500).json({
          error: "Database error while processing CSV",
          details: csvError.message,
          hint: "Make sure the database tables are properly defined and match the CSV structure",
        });
      }

      return res.status(400).json({
        error: "Failed to process CSV",
        details: csvError instanceof Error ? csvError.message : "Unknown error",
      });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      error: "File upload failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
