import { NextResponse } from "next/server";
import type { ErrorResponse, UnauthorizedError } from "./types";

/**
 * Error response utilities for auth endpoints
 */

/**
 * Create a 400 Bad Request response
 */
export function badRequest(message: string, details?: unknown): NextResponse<ErrorResponse> {
  return NextResponse.json(
    { error: message, code: "BAD_REQUEST", details },
    { status: 400 }
  );
}

/**
 * Create a 401 Unauthorized response with access request URL
 */
export function unauthorized(message = "Authentication required"): NextResponse<UnauthorizedError> {
  return NextResponse.json(
    {
      error: message,
      code: "UNAUTHORIZED",
      requestAccessUrl: "/access-request",
    },
    { status: 401 }
  );
}

/**
 * Create a 403 Forbidden response
 */
export function forbidden(message: string): NextResponse<ErrorResponse> {
  return NextResponse.json(
    { error: message, code: "FORBIDDEN" },
    { status: 403 }
  );
}

/**
 * Create a 404 Not Found response
 */
export function notFound(message: string): NextResponse<ErrorResponse> {
  return NextResponse.json(
    { error: message, code: "NOT_FOUND" },
    { status: 404 }
  );
}

/**
 * Create a 409 Conflict response
 */
export function conflict(message: string): NextResponse<ErrorResponse> {
  return NextResponse.json(
    { error: message, code: "CONFLICT" },
    { status: 409 }
  );
}

/**
 * Create a 500 Internal Server Error response
 */
export function serverError(message = "Unable to process request. Please try again later."): NextResponse<ErrorResponse> {
  return NextResponse.json(
    { error: message, code: "INTERNAL_ERROR" },
    { status: 500 }
  );
}

/**
 * Error reasons for magic link/auth error page
 */
export type AuthErrorReason = "expired" | "used" | "invalid";

/**
 * Get redirect URL to auth error page
 */
export function getAuthErrorUrl(reason: AuthErrorReason): string {
  return `/auth/error?reason=${reason}`;
}
