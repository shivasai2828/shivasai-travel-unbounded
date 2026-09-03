import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import {
  ensureAdminUser,
  verifyPassword,
  signAdminToken,
  COOKIE_NAME,
} from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    // Ensure seeded admin user exists
    await ensureAdminUser();

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "travel_unbounded");
    const admin = await db.collection("admins").findOne({ email: email.trim().toLowerCase() });

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, admin.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const token = await signAdminToken({
      id: admin._id.toString(),
      email: admin.email,
      role: "admin",
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful.",
        user: { email: admin.email, role: admin.role },
      },
      { status: 200 }
    );

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json(
      { success: false, message: "Server error during authentication." },
      { status: 500 }
    );
  }
}
