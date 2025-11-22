import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import Product from "@/models/Product";
import Location from "@/models/Location";
import Warehouse from "@/models/Warehouse";
import Operation from "@/models/Operation";
import StockQuant from "@/models/StockQuant";
import { validateOperation } from "@/backend/actions";

const ensureInternalLocation = async (randomToken) => {
  let location = await Location.findOne({}).exec();
  if (location) {
    return { location, createdLocationId: null, createdWarehouseId: null };
  }

  let warehouse = await Warehouse.findOne({}).exec();
  let createdWarehouseId = null;
  if (!warehouse) {
    warehouse = await Warehouse.create({
      name: `QA Warehouse ${randomToken}`,
      shortCode: `QA${randomToken.slice(0, 4).toUpperCase()}`,
      address: "QA Auto Generated",
    });
    createdWarehouseId = warehouse._id;
  }

  const newLocation = await Location.create({
    name: `${warehouse.shortCode}/QA-Stock-${randomToken}`,
    warehouse: warehouse._id,
  });

  return { location: newLocation, createdLocationId: newLocation._id, createdWarehouseId };
};

const validateOrThrow = async (operationId) => {
  const result = await validateOperation(operationId.toString());
  if (result?.error) {
    throw new Error(result.error);
  }
  return result;
};

export async function GET() {
  const summary = {
    setup: "PENDING",
    test_receipt: "PENDING",
    test_delivery: "PENDING",
    test_error_handling: "PENDING",
  };

  let product = null;
  let createdLocationId = null;
  let createdWarehouseId = null;
  const createdOperationIds = [];

  const cleanup = async () => {
    if (createdOperationIds.length) {
      await Operation.deleteMany({ _id: { $in: createdOperationIds } });
    }
    if (product?._id) {
      await StockQuant.deleteMany({ product: product._id });
      await Product.findByIdAndDelete(product._id);
    }
    if (createdLocationId) {
      await Location.findByIdAndDelete(createdLocationId);
    }
    if (createdWarehouseId) {
      await Warehouse.findByIdAndDelete(createdWarehouseId);
    }
  };

  try {
    await connectDB();
    const randomToken = Math.random().toString(36).slice(2, 8);

    const { location: internalLocation, createdLocationId: locId, createdWarehouseId: whId } =
      await ensureInternalLocation(randomToken);
    createdLocationId = locId;
    createdWarehouseId = whId;

    product = await Product.create({
      name: `Test-Widget-${randomToken}`,
      sku: `TEST-${randomToken.toUpperCase()}`,
      price: 100,
      cost: 50,
      totalStock: 0,
      status: "active",
    });

    summary.setup = "PASS";

    const createOperation = async ({ type, quantity, sourceLocation, destLocation }) => {
      const operation = await Operation.create({
        reference: `${type}-${randomToken}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type,
        status: "draft",
        sourceLocation,
        destLocation,
        lines: [{ product: product._id, quantity }],
      });
      createdOperationIds.push(operation._id);
      return operation;
    };

    // Test Case A - Receipt
    try {
      const receiptOp = await createOperation({
        type: "receipt",
        quantity: 10,
        sourceLocation: undefined,
        destLocation: internalLocation._id,
      });
      await validateOrThrow(receiptOp._id);
      const refreshedProduct = await Product.findById(product._id).lean();
      if (refreshedProduct?.totalStock !== 10) {
        throw new Error(`Expected stock 10, found ${refreshedProduct?.totalStock ?? "n/a"}`);
      }
      summary.test_receipt = `PASS (Stock is ${refreshedProduct.totalStock})`;
    } catch (error) {
      summary.test_receipt = `FAIL (${error.message})`;
      throw error;
    }

    // Test Case B - Delivery
    try {
      const deliveryOp = await createOperation({
        type: "delivery",
        quantity: 4,
        sourceLocation: internalLocation._id,
        destLocation: undefined,
      });
      await validateOrThrow(deliveryOp._id);
      const refreshedProduct = await Product.findById(product._id).lean();
      if (refreshedProduct?.totalStock !== 6) {
        throw new Error(`Expected stock 6, found ${refreshedProduct?.totalStock ?? "n/a"}`);
      }
      summary.test_delivery = `PASS (Stock is ${refreshedProduct.totalStock})`;
    } catch (error) {
      summary.test_delivery = `FAIL (${error.message})`;
      throw error;
    }

    // Test Case C - Insufficient stock
    try {
      const failOp = await createOperation({
        type: "delivery",
        quantity: 100,
        sourceLocation: internalLocation._id,
        destLocation: undefined,
      });
      const result = await validateOperation(failOp._id.toString());
      if (!result?.error) {
        throw new Error("Validation succeeded but should have failed");
      }
      summary.test_error_handling = "PASS (Correctly blocked invalid move)";
    } catch (error) {
      summary.test_error_handling = `FAIL (${error.message})`;
      throw error;
    }

    await cleanup();
    return NextResponse.json(summary);
  } catch (error) {
    await cleanup();
    const message = error.message || "Unexpected error";
    if (summary.setup === "PENDING") {
      summary.setup = `FAIL (${message})`;
    }
    return NextResponse.json({ ...summary, error: message }, { status: 500 });
  }
}
