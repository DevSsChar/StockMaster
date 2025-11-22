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
      enum: ["receipt", "delivery", "adjustment"],
      required: true,
    },
    operationType: {
      type: String,
      enum: ["internal", "external"],
      // Only required for delivery operations
    },
    partner: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["draft", "ready", "waiting", "done", "cancelled"],
      default: "draft",
    },
    responsible: {
      type: String,
      trim: true,
    },
    deliveryAddress: {
      type: String,
      trim: true,
    },
    receiveFrom: {
      type: String,
      trim: true,
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

// Delete cached model to ensure schema updates are applied
if (mongoose.models?.Operation) {
  delete mongoose.models.Operation;
}

const Operation = mongoose.model("Operation", operationSchema);

export default Operation;
