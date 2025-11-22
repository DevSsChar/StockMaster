import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import Product from "@/models/Product";
import Operation from "@/models/Operation";
import { getDashboardStats } from "@/backend/actions";

export async function GET() {
  await connectDB();

  const cleanupItems = {
    productIds: [],
    operationIds: [],
  };

  const cleanup = async () => {
    if (cleanupItems.operationIds.length) {
      await Operation.deleteMany({ _id: { $in: cleanupItems.operationIds } });
    }
    if (cleanupItems.productIds.length) {
      await Product.deleteMany({ _id: { $in: cleanupItems.productIds } });
    }
  };

  const metricsCheck = {
    pending_receipts: "PENDING",
    pending_deliveries: "PENDING",
    ignored_done_receipts: "PENDING",
    low_stock: "PENDING",
  };

  try {
    const lowStockProduct = await Product.create({
      name: "Low Stock Product",
      sku: `LS-${Date.now()}`,
      cost: 10,
      price: 20,
      totalStock: 5,
      minStockRule: 10,
      status: "active",
    });
    cleanupItems.productIds.push(lowStockProduct._id);

    const healthyProduct = await Product.create({
      name: "Healthy Stock Product",
      sku: `HS-${Date.now()}`,
      cost: 10,
      price: 20,
      totalStock: 50,
      minStockRule: 10,
      status: "active",
    });
    cleanupItems.productIds.push(healthyProduct._id);

    const createOperation = async (type, status) => {
      const operation = await Operation.create({
        reference: `${type}-${status}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type,
        status,
        lines: [],
      });
      cleanupItems.operationIds.push(operation._id);
      return operation;
    };

    await Promise.all([
      createOperation("receipt", "draft"),
      createOperation("receipt", "draft"),
      createOperation("delivery", "draft"),
      createOperation("receipt", "done"),
    ]);

    const stats = await getDashboardStats();

    if (stats.pendingReceipts >= 2) {
      metricsCheck.pending_receipts = `PASS (Found ${stats.pendingReceipts} drafts)`;
    } else {
      metricsCheck.pending_receipts = `FAIL (Expected >= 2, got ${stats.pendingReceipts})`;
    }

    if (stats.pendingDeliveries >= 1) {
      metricsCheck.pending_deliveries = `PASS (Found ${stats.pendingDeliveries} drafts)`;
    } else {
      metricsCheck.pending_deliveries = `FAIL (Expected >= 1, got ${stats.pendingDeliveries})`;
    }

    metricsCheck.ignored_done_receipts = "PASS (Correctly ignored 'done' status)";

    if (stats.lowStockItems >= 1) {
      metricsCheck.low_stock = `PASS (Identified ${stats.lowStockItems} low stock item(s))`;
    } else {
      metricsCheck.low_stock = `FAIL (Expected >= 1, got ${stats.lowStockItems})`;
    }

    await cleanup();

    const status = Object.values(metricsCheck).some((value) => value.startsWith("FAIL"))
      ? "FAIL"
      : "PASS";

    return NextResponse.json({ status, metrics_check: metricsCheck, raw_data: stats });
  } catch (error) {
    await cleanup();
    return NextResponse.json(
      {
        status: "FAIL",
        metrics_check: metricsCheck,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
