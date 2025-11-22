import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import Product from "@/models/Product";
import Location from "@/models/Location";
import StockQuant from "@/models/StockQuant";
import Operation from "@/models/Operation";
import { createAdjustment, getMoveHistory } from "@/backend/actions";

export async function GET() {
  await connectDB();

  const summary = {
    status: "PENDING",
    adjustment_math: "PENDING",
    history_log: "PENDING",
  };

  const cleanup = {
    productId: null,
    locationId: null,
    quantId: null,
    adjustmentOperationIds: [],
  };

  const cleanupAll = async () => {
    try {
      if (cleanup.adjustmentOperationIds.length) {
        await Operation.deleteMany({ _id: { $in: cleanup.adjustmentOperationIds } });
      }
      if (cleanup.quantId) {
        await StockQuant.findByIdAndDelete(cleanup.quantId);
      }
      if (cleanup.locationId) {
        await Location.findByIdAndDelete(cleanup.locationId);
      }
      if (cleanup.productId) {
        await Product.findByIdAndDelete(cleanup.productId);
      }
    } catch (error) {
      console.error("test-final cleanup error", error);
    }
  };

  try {
    const product = await Product.create({
      name: "Test-Adjust-Item",
      sku: `TA-${Date.now()}`,
      totalStock: 10,
      status: "active",
    });
    cleanup.productId = product._id;

    const location = await Location.create({
      name: `Test-Loc-A-${Date.now()}`,
      warehouse: product._id,
    });
    cleanup.locationId = location._id;

    const quant = await StockQuant.create({
      product: product._id,
      location: location._id,
      quantity: 10,
    });
    cleanup.quantId = quant._id;

    const adjustmentResult = await createAdjustment({
      get: (key) => {
        const map = {
          productId: product._id,
          locationId: location._id,
          realQuantity: 8,
        };
        return map[key];
      },
    });

    if (adjustmentResult?.error) {
      throw new Error(adjustmentResult.error);
    }

    const refreshedProduct = await Product.findById(product._id).lean();
    const refreshedQuant = await StockQuant.findById(quant._id).lean();

    if (refreshedProduct?.totalStock === 8 && refreshedQuant?.quantity === 8) {
      summary.adjustment_math = "PASS (Stock dropped from 10 to 8)";
    } else {
      summary.adjustment_math = `FAIL (Product=${refreshedProduct?.totalStock}, Quant=${refreshedQuant?.quantity})`;
    }

    const history = await getMoveHistory();
    const adjustmentEntry = Array.isArray(history)
      ? history.find(
          (entry) =>
            entry.type === "adjustment" &&
            entry.status === "done" &&
            Array.isArray(entry.lines) &&
            entry.lines.some((line) => line.product?.toString() === product._id.toString())
        )
      : null;

    if (adjustmentEntry) {
      summary.history_log = "PASS (Found adjustment record in Move History)";
      cleanup.adjustmentOperationIds.push(adjustmentEntry._id);
    } else {
      summary.history_log = "FAIL (No adjustment entry found)";
    }

    const hasFailure = Object.values(summary).some((value) => value.startsWith("FAIL"));
    summary.status = hasFailure ? "FAIL" : "PASS";

    await cleanupAll();
    return NextResponse.json(summary, { status: hasFailure ? 400 : 200 });
  } catch (error) {
    console.error("test-final handler error", error);
    summary.status = "FAIL";
    summary.error = error.message;
    await cleanupAll();
    return NextResponse.json(summary, { status: 500 });
  }
}
