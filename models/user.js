import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: false, // Optional - OAuth users won't have password
      select: false, // Don't return password by default in queries
    },
    image: {
      type: String,
    },
    role: {
      type: String,
      enum: ['manager', 'staff'],
      default: 'staff',
    },
    provider: {
      type: String,
      enum: ['credentials', 'google', 'github'],
      default: 'credentials',
    },
    resetCode: {
      type: String,
      select: false,
    },
    resetCodeExpiry: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

const User = mongoose.models?.User || mongoose.model("User", userSchema);

export default User;
