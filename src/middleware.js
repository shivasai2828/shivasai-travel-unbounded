import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "admin_token";
const JWT_SECRET = process.env.JWT_SECRET || "travel-unbounded-secure-admin-jwt-key-2026";
const secretKey = new TextEncoder().encode(JWT_SECRET);

async function checkAuth(request) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const authPayload = await checkAuth(request);
  const isAuthenticated = Boolean(authPayload && authPayload.role === "admin");

  // Public admin auth routes
  const isLoginPage = pathname === "/admin/login";
  const isLoginApi = pathname === "/api/admin/auth/login";

  // If already authenticated and trying to access login page, redirect to dashboard
  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Allow public access to login page and login API endpoint
  if (isLoginPage || isLoginApi) {
    return NextResponse.next();
  }

  // If unauthenticated:
  if (!isAuthenticated) {
    // API routes return 401 JSON
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Page routes redirect to /admin/login
    if (pathname.startsWith("/admin")) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
