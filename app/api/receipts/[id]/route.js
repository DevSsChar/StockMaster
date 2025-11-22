import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/db/connectDB.mjs";
import Operation from "@/models/Operation";
import User from "@/models/user";

// GET - Fetch single receipt operation
export async function GET(request, { params }) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = params;

    const receipt = await Operation.findById(id)
      .populate("sourceLocation")
      .populate("destLocation")
      .populate("lines.product");

    if (!receipt) {
      return NextResponse.json(
        { error: "Receipt not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: receipt,
    });
  } catch (error) {
    console.error("Error fetching receipt:", error);
    return NextResponse.json(
      { error: "Failed to fetch receipt", details: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update receipt operation status
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = params;
    const body = await request.json();
    const { status, formData, products } = body;

    // Check if operation exists
    const operation = await Operation.findById(id);

    if (!operation) {
      return NextResponse.json(
        { error: "Operation not found" },
        { status: 404 }
      );
    }

    // Update operation
    if (status) {
      operation.status = status.toLowerCase();
    }

    // Update products if provided
    if (products && Array.isArray(products)) {
      operation.lines = products
        .filter(p => p.name && p.quantity > 0)
        .map(p => ({
          product: p.productId || null,
          quantity: p.quantity,
        }));
    }

    // Update scheduled date if provided
    if (formData?.scheduleDate) {
      operation.scheduledDate = new Date(formData.scheduleDate);
    }

    await operation.save();

    const updatedOperation = await Operation.findById(id)
      .populate("sourceLocation")
      .populate("destLocation")
      .populate("lines.product");

    return NextResponse.json({
      success: true,
      message: "Operation updated successfully",
      data: updatedOperation,
    });
  } catch (error) {
    console.error("Error updating operation:", error);
    return NextResponse.json(
      { error: "Failed to update operation", details: error.message },
      { status: 500 }
    );
  }
}
