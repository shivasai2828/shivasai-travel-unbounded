import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import clientPromise from "@/lib/mongodb";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Missing token." },
        { status: 401 }
      );
    }

    const payload = await verifyAdminToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid token." },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "travel_unbounded");
    const rawEnquiries = await db
      .collection("enquiries")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Normalize enquiries
    const enquiries = rawEnquiries.map((e) => ({
      _id: e._id.toString(),
      fullName: e.fullName || "Unnamed Traveler",
      contactNumber: e.contactNumber || "",
      countryCode: e.countryCode || "+91",
      fullPhone: e.fullPhone || `${e.countryCode || "+91"}${e.contactNumber || ""}`,
      email: e.email || "",
      travelDate: e.travelDate || "",
      numPeople: e.numPeople || 1,
      numChildren: e.numChildren || 0,
      hotelCategory: e.hotelCategory || "Standard",
      destination: e.destination || null,
      status: e.status || "New",
      createdAt: e.createdAt ? new Date(e.createdAt).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json({ success: true, data: enquiries }, { status: 200 });
  } catch (err) {
    console.error("Fetch admin enquiries error:", err);
    return NextResponse.json(
      { success: false, message: "Server error fetching enquiries." },
      { status: 500 }
    );
  }
}
