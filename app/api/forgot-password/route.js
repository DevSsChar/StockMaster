import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import User from "@/models/user";
import { sendPasswordResetEmail } from "@/lib/emailService";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Please provide an email" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { message: "If an account exists with this email, you will receive a password reset code." },
        { status: 200 }
      );
    }

    // Check if user is using social login
    if (user.provider !== 'credentials') {
      return NextResponse.json(
        { error: `This account uses ${user.provider} login. Please sign in with ${user.provider}.` },
        { status: 400 }
      );
    }

    // Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry to 10 minutes from now
    const resetCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Save reset code to user
    user.resetCode = resetCode;
    user.resetCodeExpiry = resetCodeExpiry;
    await user.save();

    // Send email
    const emailResult = await sendPasswordResetEmail(user.email, resetCode, user.name);

    if (!emailResult.success) {
      return NextResponse.json(
        { error: "Failed to send email. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: "Password reset code sent to your email.",
        email: user.email 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
