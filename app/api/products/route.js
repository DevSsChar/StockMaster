import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getProducts } from "@/backend/actions";

export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const products = await getProducts({ search });

    return NextResponse.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error) {
    console.error("GET products error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
