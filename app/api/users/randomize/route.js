import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import User from "@/models/user";

export async function POST() {
  try {
    await connectDB();

    const users = await User.find({}).select("_id role");
    if (!users.length) {
      return NextResponse.json(
        { message: "No users available to update", updated: 0 },
        { status: 200 }
      );
    }

    const roles = ["manager", "staff"];
    const operations = users
      .map((user) => {
        const nextRole = roles[Math.floor(Math.random() * roles.length)];
        if (nextRole === user.role) {
          return null;
        }
        return {
          updateOne: {
            filter: { _id: user._id },
            update: { role: nextRole },
          },
        };
      })
      .filter(Boolean);

    if (operations.length) {
      await User.bulkWrite(operations);
    }

    return NextResponse.json(
      {
        success: true,
        updated: operations.length,
        message: operations.length
          ? `Randomized roles for ${operations.length} user(s)`
          : "All users already had randomly selected roles",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("randomize user roles api error", error);
    return NextResponse.json(
      { error: "Failed to randomize roles" },
      { status: 500 }
    );
  }
}
