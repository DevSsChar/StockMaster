import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/db/connectDB.mjs";
import Operation from "@/models/Operation";
import User from "@/models/user";

// GET - Fetch all receipt operations
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

    // Fetch all receipt operations
    const receipts = await Operation.find({ type: "receipt" })
      .populate("sourceLocation")
      .populate("destLocation")
      .populate("lines.product")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: receipts,
      count: receipts.length,
    });
  } catch (error) {
    console.error("Error fetching receipts:", error);
    return NextResponse.json(
      { error: "Failed to fetch receipts", details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new receipt operation (Manager only)
export async function POST(request) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    await connectDB();

    // Check user role
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.role !== "manager") {
      return NextResponse.json(
        { error: "Forbidden - Only managers can create receipts" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { receiveFrom, responsible, scheduleDate, products, status } = body;

    // Generate reference number
    const lastReceipt = await Operation.findOne({ type: "receipt" })
      .sort({ createdAt: -1 });
    
    let referenceNumber = 1;
    if (lastReceipt && lastReceipt.reference) {
      const match = lastReceipt.reference.match(/WH\/IN\/(\d+)/);
      if (match) {
        referenceNumber = parseInt(match[1]) + 1;
      }
    }
    const reference = `WH/IN/${String(referenceNumber).padStart(4, '0')}`;

    // Transform products to operation lines
    // Only include products that have a valid productId to avoid validation errors
    const lines = products
      .filter(p => p.name && p.quantity > 0 && p.productId)
      .map(p => ({
        product: p.productId,
        quantity: p.quantity,
      }));

    // Create new receipt operation
    const newReceipt = await Operation.create({
      reference,
      type: "receipt",
      status: status || "draft",
      sourceLocation: null, // Can be populated if needed
      destLocation: null, // Can be populated if needed
      lines,
      scheduledDate: scheduleDate ? new Date(scheduleDate) : new Date(),
    });

    const populatedReceipt = await Operation.findById(newReceipt._id)
      .populate("sourceLocation")
      .populate("destLocation")
      .populate("lines.product");

    return NextResponse.json(
      {
        success: true,
        message: "Receipt created successfully",
        data: populatedReceipt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating receipt:", error);
    return NextResponse.json(
      { error: "Failed to create receipt", details: error.message },
      { status: 500 }
    );
  }
}
