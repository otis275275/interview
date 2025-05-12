import { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm, File } from "formidable";
import fs from "fs";
import { CsvParser } from "../../src/utils/csvParser";

// Add the necessary config to disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

// Define a more specific type for the parsed files
interface FormidableFiles {
  [key: string]: File[] | undefined;
}

// Add a type for form fields
interface FormidableFields {
  [key: string]: string | string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Parse form data with promise-based approach
    const form = new IncomingForm();

    // Convert callback-based form parsing to promise-based with proper types
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_fields, files] = await new Promise<
      [FormidableFields, FormidableFiles]
    >((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields as FormidableFields, files as FormidableFiles]);
      });
    });

    // Get the file array safely with optional chaining
    const fileArray = files.file;

    // Safety check to ensure file exists and is an array with at least one item
    if (!fileArray || fileArray.length === 0) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Now TypeScript knows fileArray is defined and has at least one item
    const file = fileArray[0];
    const filePath = file.filepath;

    try {
      // Process the CSV file
      const results = await CsvParser.parseCsvToDatabase(filePath);

      // Clean up the temporary file
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.error("Failed to clean up temporary file:", cleanupError);
      }

      return res.status(200).json({
        message: "CSV uploaded successfully",
        count: results.length,
      });
    } catch (processError) {
      console.error("Failed to process CSV:", processError);
      return res.status(500).json({ error: "Failed to process CSV" });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
