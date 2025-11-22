import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import User from "@/models/user";

export async function POST(req) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Please provide email and reset code" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user with reset code
    const user = await User.findOne({ 
      email: email.toLowerCase() 
    }).select('+resetCode +resetCodeExpiry');

    if (!user) {
      return NextResponse.json(
        { error: "Invalid reset code" },
        { status: 400 }
      );
    }

    // Check if reset code exists
    if (!user.resetCode || !user.resetCodeExpiry) {
      return NextResponse.json(
        { error: "No reset code found. Please request a new one." },
        { status: 400 }
      );
    }

    // Check if code has expired
    if (new Date() > user.resetCodeExpiry) {
      return NextResponse.json(
        { error: "Reset code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Verify code
    if (user.resetCode !== code) {
      return NextResponse.json(
        { error: "Invalid reset code" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        message: "Reset code verified successfully",
        verified: true 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verify reset code error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
