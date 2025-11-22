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

// POST - Create new product
export async function POST(request) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, sku, category, cost, price, minStockRule, totalStock, status } = body;

    // Validate required fields
    if (!name || !sku) {
      return NextResponse.json(
        { error: "Name and SKU are required" },
        { status: 400 }
      );
    }

    // Import dynamically to avoid circular dependencies
    const connectDB = (await import("@/db/connectDB.mjs")).default;
    const Product = (await import("@/models/Product")).default;

    await connectDB();

    // Check if product with same SKU already exists
    const existingProduct = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingProduct) {
      return NextResponse.json(
        { error: "Product with this SKU already exists" },
        { status: 409 }
      );
    }

    // Create new product
    const newProduct = await Product.create({
      name,
      sku: sku.toUpperCase(),
      category: category || '',
      cost: cost || 0,
      price: price || 0,
      minStockRule: minStockRule || 0,
      totalStock: totalStock || 0,
      status: status || 'active',
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        data: newProduct,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product", details: error.message },
      { status: 500 }
    );
  }
}
