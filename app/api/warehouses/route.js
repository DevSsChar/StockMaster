import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getWarehouses } from "@/backend/actions";

export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const warehouses = await getWarehouses();

    return NextResponse.json({
      success: true,
      data: warehouses,
      count: warehouses.length,
    });
  } catch (error) {
    console.error("GET warehouses error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch warehouses" },
      { status: 500 }
    );
  }
}
