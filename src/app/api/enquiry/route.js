import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

function validatePayload(body) {
  const errors = [];

  if (!body.fullName || !body.fullName.trim()) {
    errors.push("Full name is required.");
  }

  if (!body.contactNumber || !/^\d{6,14}$/.test(body.contactNumber.trim())) {
    errors.push("A valid contact number is required.");
  }

  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
    errors.push("A valid email is required.");
  }

  if (!body.travelDate) {
    errors.push("Travel date is required.");
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const travelDate = new Date(body.travelDate);
    if (travelDate < today) {
      errors.push("Travel date must be in the future.");
    }
  }

  if (!body.numPeople || Number(body.numPeople) < 1) {
    errors.push("Number of people must be at least 1.");
  }

  if (
    body.numChildren !== undefined &&
    body.numChildren !== "" &&
    Number(body.numChildren) < 0
  ) {
    errors.push("Number of children cannot be negative.");
  }

  const allowedCategories = ["Standard", "Deluxe", "Luxury"];
  if (body.hotelCategory && !allowedCategories.includes(body.hotelCategory)) {
    errors.push("Invalid hotel category.");
  }

  return errors;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const validationErrors = validatePayload(body);

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, message: validationErrors.join(" ") },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "travel_unbounded");

    const enquiry = {
      fullName: body.fullName.trim(),
      contactNumber: body.contactNumber.trim(),
      countryCode: body.countryCode || "+91",
      fullPhone: body.fullPhone || `${body.countryCode || "+91"}${body.contactNumber}`,
      email: body.email.trim().toLowerCase(),
      travelDate: body.travelDate,
      numPeople: Number(body.numPeople),
      hotelCategory: body.hotelCategory || "Standard",
      numChildren: body.numChildren ? Number(body.numChildren) : 0,
      destination: body.destination || null,
      createdAt: new Date(),
    };

    const result = await db.collection("enquiries").insertOne(enquiry);

    return NextResponse.json(
      {
        success: true,
        message: "Enquiry submitted successfully.",
        id: result.insertedId,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Enquiry submission error:", err);
    return NextResponse.json(
      { success: false, message: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}

// Bonus: GET all enquiries (could power a simple /admin page)
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "travel_unbounded");
    const enquiries = await db
      .collection("enquiries")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: enquiries }, { status: 200 });
  } catch (err) {
    console.error("Fetch enquiries error:", err);
    return NextResponse.json(
      { success: false, message: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}
