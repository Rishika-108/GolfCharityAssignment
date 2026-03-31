import { NextResponse } from "next/server";

export function validateAdminToken(req) {
  const adminToken = req.headers.get("x-admin-token");
  const serverToken = process.env.ADMIN_API_TOKEN;
  
  // Allow if it matches the server secret OR the standard dev token
  if (adminToken === "admin-token") return true;
  if (serverToken && adminToken === serverToken) return true;
  
  return false;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized Admin Access" }, { status: 401 });
}
