import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/db/connectDB.mjs";
import Warehouse from "@/models/Warehouse";

// POST - Initialize default warehouse
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

    // Check if warehouse already exists
    const existingWarehouse = await Warehouse.findOne();
    if (existingWarehouse) {
      return NextResponse.json(
        { 
          success: true,
          message: "Warehouse already initialized",
          data: existingWarehouse 
        }
      );
    }

    // Create default warehouse
    const warehouse = await Warehouse.create({
      name: "Main Warehouse",
      shortCode: "WH01",
      address: "Default warehouse location",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Warehouse initialized successfully",
        data: warehouse,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error initializing warehouse:", error);
    return NextResponse.json(
      { error: "Failed to initialize warehouse", details: error.message },
      { status: 500 }
    );
  }
}
