import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/db/connectDB.mjs";
import Warehouse from "@/models/Warehouse";

// GET - Fetch main warehouse
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

    // Get the first (main) warehouse
    const warehouse = await Warehouse.findOne().sort({ createdAt: 1 });

    if (!warehouse) {
      return NextResponse.json(
        { error: "No warehouse found. Please create a warehouse first." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: warehouse,
    });
  } catch (error) {
    console.error("Error fetching warehouse:", error);
    return NextResponse.json(
      { error: "Failed to fetch warehouse", details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create main warehouse (if none exists)
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

    const body = await request.json();
    const { name, shortCode, address } = body;

    if (!name || !shortCode) {
      return NextResponse.json(
        { error: "Name and short code are required" },
        { status: 400 }
      );
    }

    // Check if warehouse already exists
    const existingWarehouse = await Warehouse.findOne({ shortCode: shortCode.toUpperCase() });
    if (existingWarehouse) {
      return NextResponse.json(
        { error: "Warehouse with this short code already exists" },
        { status: 409 }
      );
    }

    const warehouse = await Warehouse.create({
      name,
      shortCode: shortCode.toUpperCase(),
      address: address || '',
    });

    return NextResponse.json(
      {
        success: true,
        message: "Warehouse created successfully",
        data: warehouse,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating warehouse:", error);
    return NextResponse.json(
      { error: "Failed to create warehouse", details: error.message },
      { status: 500 }
    );
  }
}
