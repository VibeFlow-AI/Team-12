import { MongoClient, Db } from "mongodb";

if (!process.env.DATABASE_URL) {
  throw new Error("Please add your MongoDB URI to .env.local");
}

const uri = process.env.DATABASE_URL;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect().catch((error) => {
      console.error("MongoDB connection error:", error);
      throw error;
    });
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect().catch((error) => {
    console.error("MongoDB connection error:", error);
    throw error;
  });
}

export async function getDb(): Promise<Db> {
  try {
    const client = await clientPromise;
    return client.db("team_12");
  } catch (error) {
    console.error("Failed to get database:", error);
    throw new Error("Database connection failed");
  }
}

export default clientPromise;