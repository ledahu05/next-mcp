import { NextResponse } from "next/server";
import { validateSession } from "@/lib/auth/session";

/**
 * GET /api/auth/session
 * Check if current session is valid. This endpoint is public.
 */
export async function GET() {
  const sessionStatus = await validateSession();
  return NextResponse.json(sessionStatus);
}
