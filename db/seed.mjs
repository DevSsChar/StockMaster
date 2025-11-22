import mongoose from "mongoose";
import connectDB from "./connectDB.mjs";
import User from "../models/user.js";

const seedUsers = async () => {
  try {
    await connectDB();

    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log("Users already exist. Skipping seeding.");
      return;
    }

    await User.create([
      {
        email: "manager@test.com",
        name: "Ops Manager",
        password: "123456",
        role: "manager",
      },
      {
        email: "staff@test.com",
        name: "Warehouse Staff",
        password: "123456",
        role: "staff",
      },
    ]);

    console.log("Database Seeded");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await mongoose.connection.close();
  }
};

seedUsers().then(() => process.exit(0)).catch(() => process.exit(1));
