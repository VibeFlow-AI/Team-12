import { MongoClient, Db } from "mongodb";

const uri = process.env.DATABASE_URL;

if (!uri) {
  throw new Error("Please add your MongoDB URI to .env.local");
}

// Simple connection options that often work better with Atlas SSL issues
const simpleOptions = {
  serverSelectionTimeoutMS: 5000,
  tls: true,
};

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToMongoDB() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const client = new MongoClient(uri, simpleOptions);
    await client.connect();
    
    const db = client.db("team_12");
    
    // Test the connection
    await db.admin().ping();
    
    cachedClient = client;
    cachedDb = db;
    
    console.log("Successfully connected to MongoDB Atlas");
    return { client, db };
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

export async function getSimpleDatabase(): Promise<Db> {
  const { db } = await connectToMongoDB();
  return db;
}