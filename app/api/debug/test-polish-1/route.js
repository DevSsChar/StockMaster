import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import Product from "@/models/Product";
import Operation from "@/models/Operation";
import { getProducts, getDashboardStats } from "@/backend/actions";

export async function GET() {
  await connectDB();

  const summary = {
    status: "PENDING",
    uom_check: "PENDING",
    search_check: "PENDING",
    forecast_logic: "PENDING",
    internal_kpi: "PENDING",
  };

  const cleanup = {
    productId: null,
    operationIds: [],
  };

  const cleanupAll = async () => {
    try {
      if (cleanup.operationIds.length) {
        await Operation.deleteMany({ _id: { $in: cleanup.operationIds } });
      }
      if (cleanup.productId) {
        await Product.findByIdAndDelete(cleanup.productId);
      }
    } catch (cleanupError) {
      console.error("test-polish cleanup error", cleanupError);
    }
  };

  try {
    const product = await Product.create({
      name: "Test-Polished-Item",
      sku: `TP-${Date.now()}`,
      totalStock: 10,
      uom: "liters",
      status: "active",
    });
    cleanup.productId = product._id;

    const createDraftOperation = async (type, quantity) => {
      const op = await Operation.create({
        reference: `${type}-polish-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type,
        status: "draft",
        lines: [{ product: product._id, quantity }],
      });
      cleanup.operationIds.push(op._id);
      return op;
    };

    await Promise.all([
      createDraftOperation("receipt", 5),
      createDraftOperation("delivery", 2),
      createDraftOperation("internal", 100),
    ]);

    const products = await getProducts({ search: "Test-Polished" });
    const stats = await getDashboardStats();

    if (Array.isArray(products) && products.length === 1) {
      summary.search_check = "PASS (Found item via Regex)";
      if (products[0]?.uom === "liters") {
        summary.uom_check = "PASS (Value: liters)";
      } else {
        summary.uom_check = `FAIL (Expected 'liters', got '${products[0]?.uom ?? "n/a"}')`;
      }

      if (products[0]?.forecasted === 13) {
        summary.forecast_logic = "PASS (Calculated 13)";
      } else {
        summary.forecast_logic = `FAIL (Expected 13, got ${products[0]?.forecasted ?? "n/a"})`;
      }
    } else {
      summary.search_check = `FAIL (Expected 1 item, got ${products?.length ?? "n/a"})`;
    }

    if (stats?.pendingInternal >= 1) {
      summary.internal_kpi = `PASS (Found ${stats.pendingInternal} pending)`;
    } else {
      summary.internal_kpi = `FAIL (Expected >= 1, got ${stats?.pendingInternal ?? "n/a"})`;
    }

    const failed = Object.values(summary).some((value) => value.startsWith("FAIL"));
    summary.status = failed ? "FAIL" : "PASS";

    await cleanupAll();
    return NextResponse.json(summary, { status: failed ? 400 : 200 });
  } catch (error) {
    console.error("test-polish handler error", error);
    summary.status = "FAIL";
    summary.error = error.message;
    await cleanupAll();
    return NextResponse.json(summary, { status: 500 });
  }
}
