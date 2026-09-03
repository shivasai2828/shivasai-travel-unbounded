import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";

export const COOKIE_NAME = "admin_token";
const JWT_SECRET = process.env.JWT_SECRET || "travel-unbounded-secure-admin-jwt-key-2026";
const secretKey = new TextEncoder().encode(JWT_SECRET);

export const SEEDED_ADMIN = {
  email: "admin@gmail.com",
  password: "TravelAdmin@123",
  role: "admin",
};

/**
 * Hash a plain text password
 */
export async function hashPassword(plainPassword) {
  return await bcrypt.hash(plainPassword, 10);
}

/**
 * Verify a plain text password against a hash
 */
export async function verifyPassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Sign an admin JWT with 7 days expiration
 */
export async function signAdminToken(payload) {
  return await new SignJWT({ ...payload, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

/**
 * Verify an admin JWT token
 */
export async function verifyAdminToken(token) {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch {
    return null;
  }
}

/**
 * Ensure seeded admin user exists in MongoDB
 */
export async function ensureAdminUser() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "travel_unbounded");
    const adminsCollection = db.collection("admins");

    const existing = await adminsCollection.findOne({ email: SEEDED_ADMIN.email.toLowerCase() });
    if (!existing) {
      const hashedPassword = await hashPassword(SEEDED_ADMIN.password);
      await adminsCollection.insertOne({
        email: SEEDED_ADMIN.email.toLowerCase(),
        password: hashedPassword,
        role: "admin",
        createdAt: new Date(),
      });
      console.log(`[Auth] Seeded default admin user (${SEEDED_ADMIN.email})`);
    }
  } catch (err) {
    console.error("[Auth] Error seeding admin user:", err);
  }
  return true;
}
