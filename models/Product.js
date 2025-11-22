import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, unique: true, required: true },
  category: { type: String },
  // --- NEW FIELD HERE ---
  uom: { type: String, default: 'Units' }, 
  // ----------------------
  cost: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  minStockRule: { type: Number, default: 10 },
  totalStock: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);