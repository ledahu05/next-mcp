/**
 * Shared TypeScript interfaces for auth entities
 */

export interface SessionInfo {
  authenticated: true;
  email: string;
  expiresAt: string; // ISO 8601 datetime
}

export interface UnauthenticatedInfo {
  authenticated: false;
}

export type SessionStatus = SessionInfo | UnauthenticatedInfo;

export interface AccessRequestBody {
  email: string;
}

export interface AccessRequestSuccess {
  message: string;
}

export interface LogoutSuccess {
  message: string;
}

export interface ErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}

export interface UnauthorizedError extends ErrorResponse {
  error: string;
  code: "UNAUTHORIZED";
  requestAccessUrl: string;
}

// Cookie configuration
export const SESSION_COOKIE_NAME = "session_token";

// Determine if we should use secure cookies
// Use secure if in production OR if the app URL is HTTPS
const isSecure = (): boolean => {
  if (process.env.NODE_ENV === "production") return true;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  return appUrl.startsWith("https://");
};

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isSecure(),
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
};
