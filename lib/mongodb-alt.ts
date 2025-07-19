import { MongoClient, Db } from "mongodb";

const uri = process.env.DATABASE_URL;

if (!uri) {
  throw new Error("Please add your MongoDB URI to .env.local");
}

// Use the original URI as MongoDB srv:// already includes SSL by default
const enhancedUri = uri;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const options = {
  // Connection timeouts
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 60000,
  connectTimeoutMS: 10000,
  // SSL/TLS configuration for MongoDB Atlas
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
  // Connection pool settings
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  waitQueueTimeoutMS: 10000,
  // Retry configuration
  retryWrites: true,
  retryReads: true,
};

if (process.env.NODE_ENV === "development") {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(enhancedUri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(enhancedUri, options);
  clientPromise = client.connect();
}

export async function getDatabase(): Promise<Db> {
  try {
    const client = await clientPromise;
    return client.db("team_12");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    
    // If it's an SSL error, try with a simplified connection
    if (error.message?.includes('SSL') || error.message?.includes('TLS')) {
      console.log("Attempting simplified SSL connection...");
      
      const simplifiedOptions = {
        serverSelectionTimeoutMS: 10000,
        tls: true,
      };
      
      try {
        const fallbackClient = new MongoClient(uri, simplifiedOptions);
        await fallbackClient.connect();
        return fallbackClient.db("team_12");
      } catch (fallbackError) {
        console.error("Fallback connection also failed:", fallbackError);
        throw fallbackError;
      }
    }
    
    throw error;
  }
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