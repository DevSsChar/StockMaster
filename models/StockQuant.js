import mongoose from "mongoose";

const { Schema } = mongoose;

const stockQuantSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

stockQuantSchema.index({ product: 1, location: 1 }, { unique: true });

const StockQuant = mongoose.models?.StockQuant || mongoose.model("StockQuant", stockQuantSchema);

export default StockQuant;
