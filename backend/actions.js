'use server'

import connectDB from "@/db/connectDB.mjs";
import User from "@/models/user";

export async function signupUser(formData) {
  try {
    const { email, password, name } = formData;

    // Validate input
    if (!email || !password || !name) {
      return {
        success: false,
        error: "Please provide all required fields"
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: "Please provide a valid email"
      };
    }

    // Validate password length
    if (password.length < 6) {
      return {
        success: false,
        error: "Password must be at least 6 characters"
      };
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return {
        success: false,
        error: "User with this email already exists"
      };
    }

    // Create new user (password will be hashed by the pre-save hook)
    const user = await User.create({
      email: email.toLowerCase(),
      name,
      password,
      provider: 'credentials',
    });

    return {
      success: true,
      message: "Account created successfully! Please sign in.",
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      }
    };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      success: false,
      error: "An error occurred during signup"
    };
  }
}

export async function loginUser(formData) {
  try {
    const { email, password } = formData;

    // Validate input
    if (!email || !password) {
      return {
        success: false,
        error: "Please provide email and password"
      };
    }

    await connectDB();

    // Find user and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return {
        success: false,
        error: "No account found with this email. Please sign up first."
      };
    }

    if (!user.password) {
      return {
        success: false,
        error: "Please use social login or reset your password"
      };
    }

    // Check if password matches
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return {
        success: false,
        error: "Invalid credentials. Please check your password."
      };
    }

    return {
      success: true,
      message: "Login successful",
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      }
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: "An error occurred during login"
    };
  }
}
