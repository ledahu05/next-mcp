import { cookies } from "next/headers";
import prisma from "@/lib/db/prisma";
import { hashToken, getSessionExpiry, isExpired, generateTokenPair } from "./tokens";
import { SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS, type SessionStatus } from "./types";

/**
 * Get session token from cookies
 */
export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

/**
 * Validate session token and return session status
 */
export async function validateSession(): Promise<SessionStatus> {
  const token = await getSessionToken();

  if (!token) {
    return { authenticated: false };
  }

  const tokenHash = hashToken(token);

  const session = await prisma.session.findUnique({
    where: { tokenHash },
  });

  if (!session) {
    return { authenticated: false };
  }

  if (isExpired(session.expiresAt)) {
    // Clean up expired session
    await prisma.session.delete({ where: { id: session.id } });
    return { authenticated: false };
  }

  return {
    authenticated: true,
    email: session.email,
    expiresAt: session.expiresAt.toISOString(),
  };
}

/**
 * Create a new session for a user
 * Returns the raw token to be set as a cookie
 */
export async function createSession(email: string): Promise<string> {
  const { token, tokenHash } = generateTokenPair();
  const expiresAt = getSessionExpiry();

  await prisma.session.create({
    data: {
      tokenHash,
      email,
      expiresAt,
    },
  });

  return token;
}

/**
 * Delete session by token
 */
export async function deleteSession(token: string): Promise<boolean> {
  const tokenHash = hashToken(token);

  try {
    await prisma.session.delete({
      where: { tokenHash },
    });
    return true;
  } catch {
    // Session may not exist
    return false;
  }
}

/**
 * Set session cookie in response
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
}

/**
 * Clear session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: 0,
  });
}

/**
 * Get the app URL for constructing links
 */
export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

/**
 * Check if the app is running in secure mode (HTTPS)
 */
export function isSecureMode(): boolean {
  const appUrl = getAppUrl();
  return appUrl.startsWith("https://");
}
