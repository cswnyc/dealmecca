import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Define protected routes
const protectedRoutes = [
  "/owner",
  "/admin",
];

const ownerOnlyRoutes = [
  "/owner",
];

const adminOnlyRoutes = [
  "/admin",
];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Get the session
  const session = await auth();

  // Redirect to sign-in if no session
  if (!session?.user) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Check role-specific access
  if (ownerOnlyRoutes.some((route) => pathname.startsWith(route))) {
    if (session.user.role !== "OWNER" && session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (adminOnlyRoutes.some((route) => pathname.startsWith(route))) {
    if (session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};