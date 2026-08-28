const mongoose = require("mongoose");
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const { seedDefaultPolicies } = require("../models/PolicyRule");

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  let connected = false;

  // 1. Try MongoDB Atlas URI
  if (uri) {
    try {
      console.log("Attempting MongoDB Atlas connection...");
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 2500
      });
      console.log(`MongoDB Connected (Atlas): ${conn.connection.host}`);
      connected = true;
    } catch (atlasErr) {
      console.warn("MongoDB Atlas connection skipped/failed (IP whitelist restriction):", atlasErr.message);
    }
  }

  // 2. Try Local MongoDB on port 27017
  if (!connected) {
    try {
      console.log("Connecting to local MongoDB (mongodb://127.0.0.1:27017/revenue-recovery)...");
      const conn = await mongoose.connect("mongodb://127.0.0.1:27017/revenue-recovery", {
        serverSelectionTimeoutMS: 2500
      });
      console.log(`MongoDB Connected (Local): ${conn.connection.host}`);
      connected = true;
    } catch (localErr) {
      console.warn("Local MongoDB connection failed:", localErr.message);
    }
  }

  // 3. Fallback to MongoMemoryServer
  if (!connected) {
    try {
      console.log("Falling back to MongoMemoryServer...");
      const { MongoMemoryServer } = require("mongodb-memory-server");
      const mongoServer = await MongoMemoryServer.create({
        binary: { version: "4.4.18" }
      });
      const mongoUri = mongoServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      console.log(`MongoDB Connected (In-Memory Fallback): ${conn.connection.host}`);
      connected = true;
    } catch (memErr) {
      console.error("Failed to start MongoMemoryServer fallback:", memErr.message);
      process.exit(1);
    }
  }

  try {
    await seedDefaultPolicies();
    console.log("Default policy rules and global constraints verified/seeded successfully.");
  } catch (seedErr) {
    console.error("Error seeding default policies:", seedErr);
  }
};

module.exports = connectDB;
