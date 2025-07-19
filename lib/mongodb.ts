import { MongoClient, Db } from "mongodb";

// Make MongoDB connection optional for deployment without database
const uri = process.env.DATABASE_URL;
const options = {
  // Railway and MongoDB Atlas compatible connection options
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  family: 4, // Use IPv4, skip trying IPv6
  maxPoolSize: 10,
  retryWrites: true,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Only initialize MongoDB connection if DATABASE_URL is provided
if (uri) {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect().catch((error) => {
      console.error("MongoDB connection error:", error);
      throw error;
    });
  }
} else {
  console.warn("DATABASE_URL not provided. MongoDB features will be disabled.");
}

export async function getDb(): Promise<Db | null> {
  if (!clientPromise) {
    console.warn("MongoDB not configured. Returning null.");
    return null;
  }
  
  try {
    const client = await clientPromise;
    return client.db("team_12");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    return null;
  }
}
export async function getDb2(): Promise<Db | null> {
  if (!clientPromise) {
    console.warn("MongoDB not configured. Returning null.");
    return null;
  }
  
  try {
    const client = await clientPromise;
    return client.db("team_12");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    return null;
  }
}

export default clientPromise;