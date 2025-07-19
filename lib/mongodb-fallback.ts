import { MongoClient, Db } from "mongodb";

const uri = process.env.DATABASE_URL;

if (!uri) {
  throw new Error("Please add your MongoDB URI to .env.local");
}

// Ultra-simple options for troubleshooting
const minimalOptions = {
  serverSelectionTimeoutMS: 15000,
  connectTimeoutMS: 15000,
  maxPoolSize: 3,
};

let client: MongoClient | null = null;

export async function getFallbackDatabase(): Promise<Db> {
  try {
    if (!client) {
      console.log("Creating new MongoDB connection...");
      client = new MongoClient(uri, minimalOptions);
      await client.connect();
      
      // Test the connection
      await client.db("admin").command({ ping: 1 });
      console.log("Successfully connected to MongoDB Atlas");
    }
    
    return client.db("team_12");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    
    // Reset client on error so we can retry
    client = null;
    
    // Provide helpful error message based on error type
    if (error.message?.includes('SSL') || error.message?.includes('TLS')) {
      throw new Error("SSL/TLS connection failed. Please check your MongoDB Atlas configuration.");
    } else if (error.message?.includes('authentication')) {
      throw new Error("Authentication failed. Please check your database credentials.");
    } else if (error.message?.includes('timeout')) {
      throw new Error("Connection timeout. Please check your network connection.");
    } else {
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }
}