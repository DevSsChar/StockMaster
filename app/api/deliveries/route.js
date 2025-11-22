import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/db/connectDB.mjs";
import Operation from "@/models/Operation";
import User from "@/models/user";

// GET - Fetch all delivery operations
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

    // Fetch all delivery operations
    const deliveries = await Operation.find({ type: "delivery" })
      .populate("sourceLocation")
      .populate("destLocation")
      .populate("lines.product")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: deliveries,
      count: deliveries.length,
    });
  } catch (error) {
    console.error("Error fetching deliveries:", error);
    return NextResponse.json(
      { error: "Failed to fetch deliveries", details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new delivery operation (Manager only)
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
        { error: "Forbidden - Only managers can create deliveries" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { deliveryAddress, responsible, scheduleDate, operationType, products, status } = body;

    // Determine reference prefix based on operation type
    const refPrefix = operationType === 'IN' ? 'WH/IN' : 'WH/OUT';
    const refPattern = operationType === 'IN' ? /WH\/IN\/(\d+)/ : /WH\/OUT\/(\d+)/;

    // Generate reference number based on operation type
    const lastDelivery = await Operation.findOne({ 
      type: "delivery",
      reference: { $regex: `^${refPrefix}` }
    }).sort({ createdAt: -1 });
    
    let referenceNumber = 1;
    if (lastDelivery && lastDelivery.reference) {
      const match = lastDelivery.reference.match(refPattern);
      if (match) {
        referenceNumber = parseInt(match[1]) + 1;
      }
    }
    const reference = `${refPrefix}/${String(referenceNumber).padStart(4, '0')}`;

    // Transform products to operation lines
    // Only include products that have a valid productId to avoid validation errors
    const lines = products
      .filter(p => p.name && p.quantity > 0 && p.productId)
      .map(p => ({
        product: p.productId,
        quantity: p.quantity,
      }));

    // Create new delivery operation
    const newDelivery = await Operation.create({
      reference,
      type: "delivery",
      status: status || "draft",
      sourceLocation: null, // Can be populated if needed
      destLocation: null, // Can be populated if needed
      deliveryAddress: deliveryAddress || null,
      responsible: responsible || null,
      lines,
      scheduledDate: scheduleDate ? new Date(scheduleDate) : new Date(),
    });

    const populatedDelivery = await Operation.findById(newDelivery._id)
      .populate("sourceLocation")
      .populate("destLocation")
      .populate("lines.product");

    return NextResponse.json(
      {
        success: true,
        message: "Delivery created successfully",
        data: populatedDelivery,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating delivery:", error);
    return NextResponse.json(
      { error: "Failed to create delivery", details: error.message },
      { status: 500 }
    );
  }
}
