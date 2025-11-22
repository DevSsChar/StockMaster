import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/db/connectDB.mjs";
import Operation from "@/models/Operation";

// GET - Fetch all operations with optional type filter
export async function GET(request) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    // Build filter
    const filter = {};
    if (type && type !== "all") {
      filter.type = type;
    }

    // Fetch all operations
    const operations = await Operation.find(filter)
      .populate("sourceLocation")
      .populate("destLocation")
      .populate("lines.product")
      .populate("responsible", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: operations,
      count: operations.length,
    });
  } catch (error) {
    console.error("Error fetching operations:", error);
    return NextResponse.json(
      { error: "Failed to fetch operations", details: error.message },
      { status: 500 }
    );
  }
}
