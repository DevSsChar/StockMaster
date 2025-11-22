import mongoose from "mongoose";

const warehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    shortCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },
    address: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Warehouse = mongoose.models?.Warehouse || mongoose.model("Warehouse", warehouseSchema);

export default Warehouse;
