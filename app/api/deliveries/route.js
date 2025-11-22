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
    const { deliveryAddress, responsible, scheduleDate, operationType, products, status, destWarehouseId } = body;

    // Validate operation type for deliveries
    if (!operationType || !['internal', 'external'].includes(operationType)) {
      return NextResponse.json(
        { error: "Operation type must be 'internal' or 'external'" },
        { status: 400 }
      );
    }

    // Get main warehouse as source location
    const Warehouse = (await import("@/models/Warehouse")).default;
    const sourceWarehouse = await Warehouse.findOne().sort({ createdAt: 1 });
    
    if (!sourceWarehouse) {
      return NextResponse.json(
        { error: "No warehouse found. Please create a warehouse first." },
        { status: 404 }
      );
    }

    // For internal operations, validate destination warehouse
    let destLocation = null;
    if (operationType === 'internal') {
      if (!destWarehouseId) {
        return NextResponse.json(
          { error: "Destination warehouse is required for internal transfers" },
          { status: 400 }
        );
      }
      const destWarehouse = await Warehouse.findById(destWarehouseId);
      if (!destWarehouse) {
        return NextResponse.json(
          { error: "Destination warehouse not found" },
          { status: 404 }
        );
      }
      destLocation = destWarehouseId;
    }

    // Generate reference number for deliveries (always WH/OUT)
    const lastDelivery = await Operation.findOne({ 
      type: "delivery",
      reference: { $regex: `^WH/OUT` }
    }).sort({ createdAt: -1 });
    
    let referenceNumber = 1;
    if (lastDelivery && lastDelivery.reference) {
      const match = lastDelivery.reference.match(/WH\/OUT\/(\d+)/);
      if (match) {
        referenceNumber = parseInt(match[1]) + 1;
      }
    }
    const reference = `WH/OUT/${String(referenceNumber).padStart(4, '0')}`;

    // Transform products to operation lines
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
      operationType,
      status: status || "draft",
      sourceLocation: sourceWarehouse._id,
      destLocation: destLocation,
      deliveryAddress: operationType === 'external' ? (deliveryAddress || null) : null,
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
