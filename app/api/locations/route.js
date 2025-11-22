import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getLocations } from "@/backend/actions";

export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const locations = await getLocations();

    return NextResponse.json({
      success: true,
      data: locations,
      count: locations.length,
    });
  } catch (error) {
    console.error("GET locations error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}
