import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getDashboardStats } from "@/backend/actions";

export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filters = {
      type: searchParams.get("type") || undefined,
      status: searchParams.get("status") || undefined,
      warehouse: searchParams.get("warehouse") || undefined,
      location: searchParams.get("location") || undefined,
      category: searchParams.get("category") || undefined,
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

    const stats = await getDashboardStats(filters);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("GET dashboard stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
