import { NextResponse } from "next/server";
import {
  getSessionToken,
  deleteSession,
  clearSessionCookie,
} from "@/lib/auth/session";
import { unauthorized } from "@/lib/auth/errors";

/**
 * POST /api/auth/logout
 * End the current session.
 */
export async function POST() {
  const token = await getSessionToken();

  if (!token) {
    return unauthorized("Not authenticated");
  }

  // Delete session from database
  await deleteSession(token);

  // Clear session cookie
  await clearSessionCookie();

  return NextResponse.json({
    message: "Logged out successfully",
  });
}
