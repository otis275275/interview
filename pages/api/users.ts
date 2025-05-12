import type { NextApiRequest, NextApiResponse } from "next";
import User from "../../src/models/User";
import { initializeDatabase } from "../../src/utils/dbInit";

// Initialize database on server startup
let dbInitialized = false;

const initDb = async () => {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Ensure database is initialized
  await initDb();

  try {
    if (req.method === "GET") {
      const users = await User.findAll();
      return res.status(200).json(users);
    } else if (req.method === "POST") {
      const { name, email, age } = req.body;
      const user = await User.create({ name, email, age });
      return res.status(201).json(user);
    }
    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Error handling user request:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
