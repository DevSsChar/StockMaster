import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/db/connectDB.mjs";
import Operation from "@/models/Operation";

export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const adjustments = await Operation.find({ type: "adjustment" })
      .populate("sourceLocation")
      .populate("destLocation")
      .populate("lines.product")
      .populate("responsible", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: adjustments,
      count: adjustments.length,
    });
  } catch (error) {
    console.error("GET adjustments error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch adjustments" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { location, lines, reason } = body;

    if (!location || !lines || !Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json(
        { success: false, error: "Location and product lines are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const reference = `WH/ADJ/${Date.now()}`;
    
    const adjustment = await Operation.create({
      reference,
      type: "adjustment",
      partner: reason || "Inventory Adjustment",
      sourceLocation: location,
      destLocation: location,
      lines: lines.map(line => ({
        product: line.product,
        quantity: line.quantity,
      })),
      status: "draft",
    });

    return NextResponse.json({
      success: true,
      data: adjustment,
    });
  } catch (error) {
    console.error("POST adjustment error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create adjustment" },
      { status: 500 }
    );
  }
}
