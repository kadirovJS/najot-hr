import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI yo'q .env da");
}

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// global cache (Next.js uchun muhim)
let cached = (global as any).mongoose as Cached;

if (!cached) {
  cached = (global as any).mongoose = {
    conn: null,
    promise: null,
  };
}

export async function dbConnect() {
  if (cached.conn) {
    console.log("✅ MongoDB cached connection ishlatyapti");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("⏳ MongoDB ga ulanmoqda...");

    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "mydb", // optional
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log("✅ MongoDB connected");
  } catch (error) {
    cached.promise = null;
    console.error("❌ MongoDB error:", error);
    throw error;
  }

  return cached.conn;
}