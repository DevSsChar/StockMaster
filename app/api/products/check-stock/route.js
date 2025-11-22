import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/db/connectDB.mjs";
import Product from "@/models/Product";

// POST - Check stock availability for products
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
    const { products } = body;

    if (!products || !Array.isArray(products)) {
      return NextResponse.json(
        { error: "Invalid products data" },
        { status: 400 }
      );
    }

    // Check stock for each product
    const stockResults = await Promise.all(
      products.map(async (product) => {
        if (!product.name) {
          return {
            id: product.id,
            name: product.name,
            requestedQuantity: product.quantity,
            inStock: true,
            availableStock: 0,
            message: "Product name not provided",
          };
        }

        // Try to find product by name or SKU
        const dbProduct = await Product.findOne({
          $or: [
            { name: new RegExp(product.name, "i") },
            { sku: new RegExp(product.name, "i") },
          ],
          status: "active",
        });

        if (!dbProduct) {
          return {
            id: product.id,
            name: product.name,
            requestedQuantity: product.quantity,
            inStock: false,
            availableStock: 0,
            message: "Product not found in inventory",
          };
        }

        const isAvailable = dbProduct.totalStock >= product.quantity;

        return {
          id: product.id,
          name: product.name,
          productId: dbProduct._id,
          requestedQuantity: product.quantity,
          availableStock: dbProduct.totalStock,
          inStock: isAvailable,
          message: isAvailable
            ? "In stock"
            : `Insufficient stock. Available: ${dbProduct.totalStock}`,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: stockResults,
    });
  } catch (error) {
    console.error("Error checking stock:", error);
    return NextResponse.json(
      { error: "Failed to check stock", details: error.message },
      { status: 500 }
    );
  }
}
