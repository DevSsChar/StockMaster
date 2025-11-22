import mongoose from "mongoose";

const { Schema } = mongoose;

const operationLineSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const operationSchema = new Schema(
  {
    reference: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["receipt", "delivery", "internal"],
      required: true,
    },
    partner: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["draft", "ready", "done", "cancelled"],
      default: "draft",
    },
    responsible: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    sourceLocation: {
      type: Schema.Types.ObjectId,
      ref: "Location",
    },
    destLocation: {
      type: Schema.Types.ObjectId,
      ref: "Location",
    },
    lines: {
      type: [operationLineSchema],
      default: [],
    },
    scheduledDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Operation = mongoose.models?.Operation || mongoose.model("Operation", operationSchema);

export default Operation;
