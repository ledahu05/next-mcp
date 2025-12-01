import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { hashToken, isExpired } from "@/lib/auth/tokens";
import { createSession, setSessionCookie, getAppUrl } from "@/lib/auth/session";
import { getAuthErrorUrl } from "@/lib/auth/errors";

interface RouteParams {
  params: Promise<{ token: string }>;
}

/**
 * GET /api/auth/magic/[token]
 * Consume a magic link and create a session.
 */
export async function GET(request: Request, { params }: RouteParams) {
  const appUrl = getAppUrl();
  const { token } = await params;

  // Validate token format
  if (!token || token.length !== 64) {
    return NextResponse.redirect(new URL(getAuthErrorUrl("invalid"), appUrl));
  }

  const tokenHash = hashToken(token);

  // Find the magic link
  const magicLink = await prisma.magicLink.findUnique({
    where: { tokenHash },
  });

  // Check if token exists
  if (!magicLink) {
    return NextResponse.redirect(new URL(getAuthErrorUrl("invalid"), appUrl));
  }

  // Check if already used
  if (magicLink.usedAt) {
    return NextResponse.redirect(new URL(getAuthErrorUrl("used"), appUrl));
  }

  // Check if expired
  if (isExpired(magicLink.expiresAt)) {
    return NextResponse.redirect(new URL(getAuthErrorUrl("expired"), appUrl));
  }

  // Mark magic link as used
  await prisma.magicLink.update({
    where: { id: magicLink.id },
    data: { usedAt: new Date() },
  });

  // Create session
  const sessionToken = await createSession(magicLink.email);

  // Set session cookie
  await setSessionCookie(sessionToken);

  // Redirect to home page
  return NextResponse.redirect(new URL("/", appUrl));
}
