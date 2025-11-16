import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value;

  const path = req.nextUrl.pathname;

  // Nếu chưa login → không cho vào Owner/Admin
  if (!token) {
    if (path.startsWith("/owner") || path.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Nếu login rồi nhưng cố vào admin, owner sai role
  if (role === "OWNER") {
    if (path.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/owner/dashboard", req.url));
    }
  }

  if (role === "ADMIN") {
    if (path.startsWith("/owner")) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/owner/:path*",
    "/admin/:path*"
  ],
};
