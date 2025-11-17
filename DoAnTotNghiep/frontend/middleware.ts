import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Danh sách route cần bảo vệ theo role
const OWNER_PROTECTED = ["/owner"];
const ADMIN_PROTECTED = ["/admin"];

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value || null;
  const role = req.cookies.get("role")?.value || null;

  const { pathname } = req.nextUrl;

  // =============================
  // 1. PROTECT OWNER ROUTES
  // =============================
  if (OWNER_PROTECTED.some(path => pathname.startsWith(path))) {
    // Nếu không login → về login
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Nếu role không phải OWNER → về home
    if (role !== "OWNER") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // =============================
  // 2. PROTECT ADMIN ROUTES
  // =============================
  if (ADMIN_PROTECTED.some(path => pathname.startsWith(path))) {
    // nếu chưa login
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Không phải admin → về home
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // =============================
  // 3. Allow request pass
  // =============================
  return NextResponse.next();
}

// Áp dụng cho toàn bộ đường dẫn
export const config = {
  matcher: ["/owner/:path*", "/admin/:path*"],
};
