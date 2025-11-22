import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/db/connectDB.mjs";
import Operation from "@/models/Operation";
import User from "@/models/user";

// GET - Fetch single delivery operation
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

    const { id } = await params;

    const delivery = await Operation.findById(id)
      .populate("sourceLocation")
      .populate("destLocation")
      .populate("lines.product");

    if (!delivery) {
      return NextResponse.json(
        { error: "Delivery not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: delivery,
    });
  } catch (error) {
    console.error("Error fetching delivery:", error);
    return NextResponse.json(
      { error: "Failed to fetch delivery", details: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update delivery operation status
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

    const { id } = await params;
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
        .filter(p => p.name && p.quantity > 0 && p.productId)
        .map(p => ({
          product: p.productId,
          quantity: p.quantity,
        }));
    }

    // Update form data fields if provided
    if (formData) {
      if (formData.scheduleDate) {
        operation.scheduledDate = new Date(formData.scheduleDate);
      }
      if (formData.deliveryAddress !== undefined) {
        operation.deliveryAddress = formData.deliveryAddress || null;
      }
      if (formData.responsible !== undefined) {
        operation.responsible = formData.responsible || null;
      }
    }

    await operation.save();

    const updatedOperation = await Operation.findById(id)
      .populate("sourceLocation")
      .populate("destLocation")
      .populate("lines.product");

    return NextResponse.json({
      success: true,
      message: "Delivery updated successfully",
      data: updatedOperation,
    });
  } catch (error) {
    console.error("Error updating delivery:", error);
    return NextResponse.json(
      { error: "Failed to update delivery", details: error.message },
      { status: 500 }
    );
  }
}
