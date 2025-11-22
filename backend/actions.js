'use server';

import { revalidatePath } from "next/cache";
import connectDB from "@/db/connectDB.mjs";
import Product from "@/models/Product";
import Location from "@/models/Location";
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

    const products = await Product.find(filter).sort({ name: 1 }).lean();
    return serialize(products);
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

export async function createLocation(formData) {
  try {
    const name = getField(formData, "name")?.toString().trim();
    const type = getField(formData, "type")?.toString().trim();
    const address = getField(formData, "address")?.toString().trim() || undefined;

    if (!name) {
      return { error: "Location name is required" };
    }

    await connectDB();

    await Location.create({
      name,
      type,
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

    const type = getField(formData, "type");
    if (typeof type === "string" && type.trim()) {
      updates.type = type.trim();
    }

    const address = getField(formData, "address");
    if (typeof address === "string") {
      updates.address = address.trim() || undefined;
    }

    if (!Object.keys(updates).length) {
      return { error: "No location updates provided" };
    }

    await connectDB();
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

export async function signupUser({ email, password, name }) {
  try {
    if (!email || !password || !name) {
      return { error: "All fields are required" };
    }

    const normalizedEmail = email.toLowerCase().trim();

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return { error: "User already exists with this email" };
    }

    // Create new user
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "staff", // Default role
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

    // Find user and explicitly select password field
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return { error: "Invalid email or password" };
    }

    // Check if user has a password (OAuth users might not have one)
    if (!user.password) {
      return { error: "This account uses social login. Please sign in with Google or GitHub." };
    }

    // Verify password
    const bcrypt = require('bcryptjs');
    console.log('Login attempt:', { email: normalizedEmail, hasPassword: !!user.password });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);
    if (!isPasswordValid) {
      return { error: "Invalid email or password" };
    }

    return { 
      success: true, 
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  } catch (error) {
    console.error("loginUser error", error);
    return { error: "Login failed. Please try again." };
  }
}