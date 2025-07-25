import { MongoClient, Db } from "mongodb";

const uri = process.env.DATABASE_URL;

if (!uri) {
  throw new Error("Please add your MongoDB URI to .env.local");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  // No SSL/TLS options - using default connection
};

if (process.env.NODE_ENV === "development") {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect().catch((error) => {
      console.error("MongoDB connection error (alt-development):", error.message);
      return Promise.reject(error);
    });
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect().catch((error) => {
    console.error("MongoDB connection error (alt-production):", error.message);
    return Promise.reject(error);
  });
}

export async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db("team_12");
}

export async function connectToDatabase() {
  try {
    const client = await clientPromise;
    const db = client.db("team_12");
    
    // Test the connection
    await db.admin().ping();
    console.log("Successfully connected to MongoDB Atlas");
    
    return { client, db };
  } catch (error) {
    console.error("Failed to connect to MongoDB Atlas:", error);
    throw error;
  }
}

export default clientPromise;