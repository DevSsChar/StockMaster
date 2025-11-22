'use server';

import { revalidatePath } from "next/cache";
import connectDB from "@/db/connectDB.mjs";
import Product from "@/models/Product";
import Location from "@/models/Location";
import Warehouse from "@/models/Warehouse";
import Operation from "@/models/Operation";
import StockQuant from "@/models/StockQuant";
import User from "@/models/user";

const serialize = (data) => JSON.parse(JSON.stringify(data));

const getField = (formData, key) => {
  if (formData && typeof formData.get === "function") {
    return formData.get(key);
  }
  return formData?.[key];
};

const parseNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const toObjectId = (value) => value?.toString().trim();

const isInternalLocation = (location) => Boolean(location && location.warehouse);

const getLocationId = (location) => {
  if (!location) {
    return undefined;
  }
  return toObjectId(location._id || location);
};

const adjustProductTotal = async (productId, delta) => {
  if (!productId || !delta) {
    return;
  }
  await Product.findByIdAndUpdate(productId, { $inc: { totalStock: delta } });
};

export async function createProduct(formData) {
  try {
    const name = getField(formData, "name")?.toString().trim();
    const sku = getField(formData, "sku")?.toString().trim();
    const category = getField(formData, "category")?.toString().trim() || undefined;
    const cost = parseNumber(getField(formData, "cost"));
    const price = parseNumber(getField(formData, "price"));

    if (!name || !sku) {
      return { error: "Product name and SKU are required" };
    }

    await connectDB();

    await Product.create({
      name,
      sku: sku.toUpperCase(),
      category,
      cost,
      price,
    });

    revalidatePath("/inventory/products");
    return { success: true };
  } catch (error) {
    console.error("createProduct error", error);
    return { error: "Failed to create product" };
  }
}

export async function getProducts(query = {}) {
  try {
    await connectDB();

    const filter = { status: "active" };
    if (query?.search) {
      const regex = new RegExp(query.search, "i");
      filter.$or = [{ name: regex }, { sku: regex }];
    }

    const [products, draftOperations] = await Promise.all([
      Product.find(filter).sort({ name: 1 }).lean(),
      Operation.find({ status: "draft" }).select("type lines").lean(),
    ]);

    const adjustments = new Map();

    draftOperations.forEach((operation) => {
      const direction = operation.type === "receipt" ? 1 : operation.type === "delivery" ? -1 : 0;
      if (!direction || !Array.isArray(operation.lines)) {
        return;
      }

      operation.lines.forEach((line) => {
        const productId = toObjectId(line?.product);
        const quantity = parseNumber(line?.quantity);
        if (!productId || quantity <= 0) {
          return;
        }
        const nextValue = (adjustments.get(productId) || 0) + direction * quantity;
        adjustments.set(productId, nextValue);
      });
    });

    const withForecast = products.map((product) => {
      const productId = product._id?.toString();
      const delta = productId ? adjustments.get(productId) || 0 : 0;
      const totalStock = parseNumber(product.totalStock, 0);
      return {
        ...product,
        uom: product.uom || "Units",
        forecasted: totalStock + delta,
      };
    });

    return serialize(withForecast);
  } catch (error) {
    console.error("getProducts error", error);
    return [];
  }
}

export async function getLocations() {
  try {
    await connectDB();
    const locations = await Location.find({ status: "active" }).sort({ name: 1 }).lean();
    return serialize(locations);
  } catch (error) {
    console.error("getLocations error", error);
    return [];
  }
}

export async function createWarehouse(formData) {
  try {
    const name = getField(formData, "name")?.toString().trim();
    const shortCode = getField(formData, "shortCode")?.toString().trim();
    const address = getField(formData, "address")?.toString().trim() || undefined;

    if (!name || !shortCode) {
      return { error: "Warehouse name and short code are required" };
    }

    await connectDB();

    const upperShortCode = shortCode.toUpperCase();
    const warehouse = await Warehouse.create({
      name,
      shortCode: upperShortCode,
      address,
    });

    await Location.create({
      name: `${upperShortCode}/Stock`,
      warehouse: warehouse._id,
    });

    revalidatePath("/inventory/warehouses");
    revalidatePath("/inventory/locations");
    return { success: true };
  } catch (error) {
    console.error("createWarehouse error", error);
    return { error: "Failed to create warehouse" };
  }
}

export async function getWarehouses() {
  try {
    await connectDB();
    const warehouses = await Warehouse.find({}).sort({ name: 1 }).lean();
    return serialize(warehouses);
  } catch (error) {
    console.error("getWarehouses error", error);
    return [];
  }
}

export async function createLocation(formData) {
  try {
    const name = getField(formData, "name")?.toString().trim();
    const address = getField(formData, "address")?.toString().trim() || undefined;
    const warehouseId = toObjectId(getField(formData, "warehouse"));

    if (!name) {
      return { error: "Location name is required" };
    }

    if (!warehouseId) {
      return { error: "Warehouse is required" };
    }

    await connectDB();

    await Location.create({
      name,
      warehouse: warehouseId,
      address,
    });

    revalidatePath("/inventory/locations");
    return { success: true };
  } catch (error) {
    console.error("createLocation error", error);
    return { error: "Failed to create location" };
  }
}

export async function updateProduct(formData) {
  try {
    const id = toObjectId(getField(formData, "id"));
    if (!id) {
      return { error: "Product id is required" };
    }

    const updates = {};
    const name = getField(formData, "name");
    if (typeof name === "string" && name.trim()) {
      updates.name = name.trim();
    }

    const sku = getField(formData, "sku");
    if (typeof sku === "string" && sku.trim()) {
      updates.sku = sku.trim().toUpperCase();
    }

    const category = getField(formData, "category");
    if (typeof category === "string") {
      updates.category = category.trim() || undefined;
    }

    const costValue = getField(formData, "cost");
    if (costValue !== undefined && costValue !== null && costValue !== "") {
      updates.cost = parseNumber(costValue);
    }

    const priceValue = getField(formData, "price");
    if (priceValue !== undefined && priceValue !== null && priceValue !== "") {
      updates.price = parseNumber(priceValue);
    }

    const minStockValue = getField(formData, "minStockRule");
    if (minStockValue !== undefined && minStockValue !== null && minStockValue !== "") {
      updates.minStockRule = parseNumber(minStockValue);
    }

    if (!Object.keys(updates).length) {
      return { error: "No product updates provided" };
    }

    await connectDB();
    const updated = await Product.findByIdAndUpdate(id, updates, { new: false });
    if (!updated) {
      return { error: "Product not found" };
    }

    revalidatePath("/inventory/products");
    return { success: true };
  } catch (error) {
    console.error("updateProduct error", error);
    return { error: "Failed to update product" };
  }
}

export async function archiveProduct(id) {
  try {
    const productId = toObjectId(id);
    if (!productId) {
      return { error: "Product id is required" };
    }

    await connectDB();
    const archived = await Product.findByIdAndUpdate(productId, { status: "archived" });
    if (!archived) {
      return { error: "Product not found" };
    }

    revalidatePath("/inventory/products");
    return { success: true };
  } catch (error) {
    console.error("archiveProduct error", error);
    return { error: "Failed to archive product" };
  }
}

export async function updateLocation(formData) {
  try {
    const id = toObjectId(getField(formData, "id"));
    if (!id) {
      return { error: "Location id is required" };
    }

    const updates = {};
    const name = getField(formData, "name");
    if (typeof name === "string" && name.trim()) {
      updates.name = name.trim();
    }

    const address = getField(formData, "address");
    if (typeof address === "string") {
      updates.address = address.trim() || undefined;
    }

    const warehouseField = getField(formData, "warehouse");
    if (warehouseField !== undefined) {
      updates.warehouse = toObjectId(warehouseField) || undefined;
    }

    if (!Object.keys(updates).length) {
      return { error: "No location updates provided" };
    }

    await connectDB();
    const current = await Location.findById(id).select("warehouse");
    if (!current) {
      return { error: "Location not found" };
    }

    const finalWarehouse = Object.prototype.hasOwnProperty.call(updates, "warehouse")
      ? updates.warehouse
      : current.warehouse;

    if (!finalWarehouse) {
      return { error: "Warehouse is required" };
    }

    const updated = await Location.findByIdAndUpdate(id, updates, { new: false });
    if (!updated) {
      return { error: "Location not found" };
    }

    revalidatePath("/inventory/locations");
    return { success: true };
  } catch (error) {
    console.error("updateLocation error", error);
    return { error: "Failed to update location" };
  }
}

export async function archiveLocation(id) {
  try {
    const locationId = toObjectId(id);
    if (!locationId) {
      return { error: "Location id is required" };
    }

    await connectDB();
    const archived = await Location.findByIdAndUpdate(locationId, { status: "archived" });
    if (!archived) {
      return { error: "Location not found" };
    }

    revalidatePath("/inventory/locations");
    return { success: true };
  } catch (error) {
    console.error("archiveLocation error", error);
    return { error: "Failed to archive location" };
  }
}

const parseOperationLines = (input) => {
  if (input === undefined || input === null) {
    return [];
  }

  let rawLines = input;
  if (typeof input === "string") {
    if (!input.trim()) {
      return [];
    }
    try {
      rawLines = JSON.parse(input);
    } catch (error) {
      throw new Error("Invalid lines payload");
    }
  }

  if (!Array.isArray(rawLines)) {
    throw new Error("Lines payload must be an array");
  }

  return rawLines
    .map((line) => {
      const product = toObjectId(line?.product);
      const quantity = parseNumber(line?.quantity);
      if (!product || quantity <= 0) {
        return null;
      }
      return { product, quantity };
    })
    .filter(Boolean);
};

const buildOperationReference = (type) => {
  const prefixes = {
    receipt: "WH/IN/",
    delivery: "WH/OUT/",
    internal: "WH/INT/",
    adjustment: "WH/ADJ/",
  };
  return `${prefixes[type] || "WH/OP/"}${Date.now()}`;
};

export async function createOperation(formData) {
  try {
    const type = getField(formData, "type")?.toString().trim();
    if (!type) {
      return { error: "Operation type is required" };
    }

    const partner = getField(formData, "partner")?.toString().trim() || undefined;
    const sourceLocation = toObjectId(getField(formData, "sourceLocation"));
    const destLocation = toObjectId(getField(formData, "destLocation"));
    const responsible = toObjectId(getField(formData, "responsible")) || undefined;

    let lines = [];
    try {
      lines = parseOperationLines(getField(formData, "lines"));
    } catch (parseError) {
      return { error: parseError.message };
    }

    await connectDB();

    await Operation.create({
      reference: buildOperationReference(type),
      type,
      partner,
      sourceLocation,
      destLocation,
      responsible,
      lines,
      status: "draft",
    });

    revalidatePath("/inventory/operations");
    return { success: true };
  } catch (error) {
    console.error("createOperation error", error);
    return { error: "Failed to create operation" };
  }
}

export async function getOperations(typeFilter) {
  try {
    await connectDB();

    const filter = {};
    if (typeFilter) {
      filter.type = typeFilter;
    }

    const operations = await Operation.find(filter)
      .populate("sourceLocation")
      .populate("destLocation")
      .populate("responsible", "name")
      .sort({ createdAt: -1 })
      .lean();

    return serialize(operations);
  } catch (error) {
    console.error("getOperations error", error);
    return [];
  }
}

export async function getMoveHistory() {
  try {
    await connectDB();

    const moves = await Operation.find({ status: "done" })
      .populate("sourceLocation")
      .populate("destLocation")
      .populate("responsible", "name")
      .sort({ updatedAt: -1 })
      .lean();

    return serialize(moves);
  } catch (error) {
    console.error("getMoveHistory error", error);
    return [];
  }
}

export async function getDashboardStats() {
  try {
    await connectDB();

    const [pendingReceipts, pendingDeliveries, pendingInternal, lowStockItems, totalProducts] =
      await Promise.all([
        Operation.countDocuments({ type: "receipt", status: "draft" }),
        Operation.countDocuments({ type: "delivery", status: "draft" }),
        Operation.countDocuments({ type: "internal", status: "draft" }),
        Product.countDocuments({
          status: "active",
          $expr: { $lt: ["$totalStock", "$minStockRule"] },
        }),
        Product.countDocuments({ status: "active" }),
      ]);

    return serialize({
      pendingReceipts,
      pendingDeliveries,
      pendingInternal,
      lowStockItems,
      totalProducts,
    });
  } catch (error) {
    console.error("getDashboardStats error", error);
    return serialize({
      pendingReceipts: 0,
      pendingDeliveries: 0,
      pendingInternal: 0,
      lowStockItems: 0,
      totalProducts: 0,
    });
  }
}

export async function getStockQuants(productId) {
  try {
    const productObjectId = toObjectId(productId);
    if (!productObjectId) {
      return [];
    }

    await connectDB();
    const quants = await StockQuant.find({ product: productObjectId })
      .populate("location", "name")
      .lean();

    return serialize(quants);
  } catch (error) {
    console.error("getStockQuants error", error);
    return [];
  }
}

export async function validateOperation(id) {
  try {
    const operationId = toObjectId(id);
    if (!operationId) {
      return { error: "Operation id is required" };
    }

    await connectDB();

    const operation = await Operation.findById(operationId)
      .populate("sourceLocation")
      .populate("destLocation")
      .populate({ path: "lines.product", select: "name" });

    if (!operation) {
      return { error: "Operation not found" };
    }

    if (operation.status === "done") {
      return { error: "Operation already validated" };
    }

    const sourceInternal = isInternalLocation(operation.sourceLocation);
    const destInternal = isInternalLocation(operation.destLocation);
    const sourceLocationId = getLocationId(operation.sourceLocation);
    const destLocationId = getLocationId(operation.destLocation);

    for (const line of operation.lines) {
      const lineProduct = line.product;
      const productId = toObjectId(lineProduct?._id || lineProduct);
      const productName = lineProduct?.name || "product";
      const quantity = parseNumber(line.quantity, 0);

      if (!productId || quantity <= 0) {
        continue;
      }

      if (sourceInternal && sourceLocationId) {
        const quant = await StockQuant.findOne({ product: productId, location: sourceLocationId });
        if (!quant || quant.quantity < quantity) {
          throw new Error(`Insufficient stock for ${productName} at source`);
        }
        quant.quantity -= quantity;
        await quant.save();

        if (!destInternal) {
          await adjustProductTotal(productId, -quantity);
        }
      }

      if (destInternal && destLocationId) {
        await StockQuant.findOneAndUpdate(
          { product: productId, location: destLocationId },
          { $inc: { quantity } },
          { upsert: true, setDefaultsOnInsert: true }
        );

        if (!sourceInternal) {
          await adjustProductTotal(productId, quantity);
        }
      }
    }

    operation.status = "done";
    await operation.save();

    revalidatePath("/inventory/dashboard");
    revalidatePath("/inventory/products");
    revalidatePath("/inventory/operations");

    return { success: true };
  } catch (error) {
    console.error("validateOperation error", error);
    return { error: error.message || "Failed to validate operation" };
  }
}

export async function createAdjustment(formData) {
  try {
    const productId = toObjectId(getField(formData, "productId"));
    const locationId = toObjectId(getField(formData, "locationId"));
    const realQuantityRaw = getField(formData, "realQuantity");
    const realQuantity = parseNumber(realQuantityRaw, NaN);

    if (!productId || !locationId) {
      return { error: "Product and location are required" };
    }

    if (!Number.isFinite(realQuantity) || realQuantity < 0) {
      return { error: "Real quantity must be a non-negative number" };
    }

    await connectDB();

    const currentQuant = await StockQuant.findOne({ product: productId, location: locationId });
    const currentQuantity = currentQuant?.quantity ?? 0;
    const diff = realQuantity - currentQuantity;

    if (diff === 0) {
      return { success: true, message: "No adjustment needed" };
    }

    await StockQuant.findOneAndUpdate(
      { product: productId, location: locationId },
      { $set: { quantity: realQuantity } },
      { upsert: true, setDefaultsOnInsert: true }
    );

    await Product.findByIdAndUpdate(productId, { $inc: { totalStock: diff } });

    await Operation.create({
      reference: `ADJ/${Date.now()}`,
      type: "adjustment",
      status: "done",
      sourceLocation: locationId,
      destLocation: locationId,
      lines: [
        {
          product: productId,
          quantity: Math.abs(diff),
        },
      ],
    });

    revalidatePath("/inventory/dashboard");
    revalidatePath("/inventory/products");

    return { success: true, diff };
  } catch (error) {
    console.error("createAdjustment error", error);
    return { error: "Failed to apply stock adjustment" };
  }
}

export async function getAllUsers() {
  try {
    await connectDB();

    const users = await User.find({})
      .select("name email role createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return serialize(
      users.map((user) => ({
        id: user._id?.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      }))
    );
  } catch (error) {
    console.error("getAllUsers error", error);
    return [];
  }
}

export async function updateUserRole(email, newRole) {
  try {
    if (!email || !newRole) {
      return { error: "Email and role are required" };
    }

    const normalizedEmail = email.toLowerCase();
    const allowedRoles = ["manager", "staff"];
    if (!allowedRoles.includes(newRole)) {
      return { error: "Invalid role" };
    }

    await connectDB();
    const updated = await User.findOneAndUpdate(
      { email: normalizedEmail },
      { role: newRole },
      { new: false }
    );

    if (!updated) {
      return { error: "User not found" };
    }

    revalidatePath("/settings/users");
    return { success: true };
  } catch (error) {
    console.error("updateUserRole error", error);
    return { error: "Failed to update role" };
  }
}

export async function deleteUser(id) {
  try {
    const userId = toObjectId(id);
    if (!userId) {
      return { error: "User id is required" };
    }

    await connectDB();
    const deleted = await User.findByIdAndDelete(userId);
    if (!deleted) {
      return { error: "User not found" };
    }

    revalidatePath("/settings/users");
    return { success: true };
  } catch (error) {
    console.error("deleteUser error", error);
    return { error: "Failed to delete user" };
  }
}
export async function randomizeUserRoles() {
  try {
    await connectDB();

    const users = await User.find({}).select("_id role");
    if (!users.length) {
      return { error: "No users available" };
    }

    const roles = ["manager", "staff"];
    const operations = users
      .map((user) => {
        const nextRole = roles[Math.floor(Math.random() * roles.length)];
        if (nextRole === user.role) {
          return null;
        }
        return {
          updateOne: {
            filter: { _id: user._id },
            update: { role: nextRole },
          },
        };
      })
      .filter(Boolean);

    if (operations.length) {
      await User.bulkWrite(operations);
      revalidatePath("/settings/users");
    }

    return { success: true, updated: operations.length };
  } catch (error) {
    console.error("randomizeUserRoles error", error);
    return { error: "Failed to randomize roles" };
  }
}

export async function signupUser({ email, password, name }) {
  try {
    if (!email || !password || !name) {
      return { error: "All fields are required" };
    }

    const normalizedEmail = email.toLowerCase().trim();

    await connectDB();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return { error: "User already exists with this email" };
    }

    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "staff",
      provider: "credentials",
    });

    return { success: true, message: "Account created successfully! Please login." };
  } catch (error) {
    console.error("signupUser error", error);
    return { error: "Failed to create account. Please try again." };
  }
}

export async function loginUser({ email, password }) {
  try {
    if (!email || !password) {
      return { error: "Email and password are required" };
    }

    const normalizedEmail = email.toLowerCase().trim();

    await connectDB();

    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user) {
      return { error: "Invalid email or password" };
    }

    if (!user.password) {
      return { error: "This account uses social login. Please sign in with Google or GitHub." };
    }

    const bcrypt = require("bcryptjs");
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { error: "Invalid email or password" };
    }

    return {
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("loginUser error", error);
    return { error: "Login failed. Please try again." };
  }
}
