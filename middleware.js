import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Protected admin routes
  const adminRoutes = ["/api/admin", "/api/draw/run", "/api/draw/finalize", "/api/winners/review"];
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  if (isAdminRoute) {
    const adminToken = request.headers.get("x-admin-token");
    if (!adminToken || adminToken !== process.env.ADMIN_API_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Protected user routes
  const userRoutes = ["/api/scores", "/api/winners/proof", "/api/donations/direct", "/api/user/profile", "/api/subscription/manage"];
  const isUserRoute = userRoutes.some((route) => pathname.startsWith(route));

  if (isUserRoute) {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing auth token" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
