import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import User from "@/models/user";

export async function GET() {
  try {
    await connectDB();
    const users = await User.find({})
      .select("name email role createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const serialized = users.map((user) => ({
      id: user._id?.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    }));

    return NextResponse.json(serialized, { status: 200 });
  } catch (error) {
    console.error("users GET error", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { email, role } = await req.json();
    if (!email || !role) {
      return NextResponse.json({ error: "Email and role are required" }, { status: 400 });
    }

    const allowedRoles = ["manager", "staff"];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    await connectDB();
    const updated = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { role },
      { new: true }
    ).select("name email role createdAt");

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        id: updated._id?.toString(),
        name: updated.name,
        email: updated.email,
        role: updated.role,
        createdAt: updated.createdAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("users PATCH error", error);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "User id is required" }, { status: 400 });
    }

    await connectDB();
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: `Deleted user ${deleted.email}` },
      { status: 200 }
    );
  } catch (error) {
    console.error("users DELETE error", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
