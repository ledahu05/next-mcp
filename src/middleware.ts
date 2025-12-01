import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Middleware for API-only route protection
 *
 * IMPORTANT: This middleware ONLY protects API endpoints that consume LLM tokens.
 * All pages and UI remain publicly accessible per constitution requirement:
 * "All other routes and endpoints that do not consume LLM tokens SHOULD be public"
 *
 * Protected: /api/chat (LLM-consuming)
 * Public: All pages (/, /access-request, etc.)
 * Public: Auth endpoints (/api/access/*, /api/auth/*)
 */

const SESSION_COOKIE_NAME = "session_token";

export async function middleware(request: NextRequest) {
  // Get session token from cookies
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // If no session token, return 401 with guidance
  if (!sessionToken) {
    return NextResponse.json(
      {
        error: "Authentication required",
        code: "UNAUTHORIZED",
        requestAccessUrl: "/access-request",
      },
      { status: 401 }
    );
  }

  // For middleware, we do a lightweight check - token exists
  // Full validation (expiry, database lookup) happens in the route handler
  // This is because Edge Runtime has limitations on database connections

  // Let the request through - route handler will do full validation
  return NextResponse.next();
}

// ONLY protect /api/chat endpoints - everything else is public
export const config = {
  matcher: ["/api/chat/:path*"],
};
