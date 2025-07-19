# MongoDB Setup Guide

This project has been migrated from Prisma to MongoDB. Here's how to set it up:

## Environment Variables

Add your MongoDB connection string to your environment files:

```bash
# For local development (.env.local)
DATABASE_URL="mongodb://localhost:27017/your-database-name"

# For MongoDB Atlas (.env.production)
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/database-name"
```

## Database Structure

The application uses a single collection called `samples` with the following structure:

```javascript
{
  _id: ObjectId,        // MongoDB auto-generated ID
  id: String,           // Custom sample ID (unique)
  createdAt: Date,      // Creation timestamp
  updatedAt: Date       // Last update timestamp
}
```

## Local MongoDB Setup

### Option 1: MongoDB Community Server
1. Download and install MongoDB Community Server
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/your-database-name`

### Option 2: MongoDB Atlas (Cloud)
1. Create account at https://cloud.mongodb.com
2. Create a new cluster
3. Get connection string from "Connect" button
4. Replace `<password>` and `<dbname>` in the connection string

### Option 3: Docker
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Running the Application

1. Install dependencies: `npm install`
2. Set up your DATABASE_URL in `.env.local`
3. Start the development server: `npm run dev`

The application will automatically create the `samples` collection when you add your first sample.