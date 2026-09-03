import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";

const ALLOWED_STATUSES = ["New", "Contacted", "Converted", "Closed"];

export async function PATCH(request, context) {
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

    const { id } = await context.params;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid enquiry ID format." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "travel_unbounded");
    const result = await db.collection("enquiries").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Enquiry not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Status updated to ${status}.`,
      status,
    });
  } catch (err) {
    console.error("Update enquiry error:", err);
    return NextResponse.json(
      { success: false, message: "Server error updating enquiry." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
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

    const { id } = await context.params;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid enquiry ID format." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "travel_unbounded");
    const result = await db.collection("enquiries").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Enquiry not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Enquiry deleted successfully.",
    });
  } catch (err) {
    console.error("Delete enquiry error:", err);
    return NextResponse.json(
      { success: false, message: "Server error deleting enquiry." },
      { status: 500 }
    );
  }
}
