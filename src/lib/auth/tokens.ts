import { randomBytes, createHash } from "crypto";

/**
 * Token generation utilities for magic links and session tokens.
 * All tokens use 256-bit entropy (32 bytes) per constitution requirements.
 */

/**
 * Generate a cryptographically secure random token
 * @returns 64-character hex string (32 bytes = 256 bits of entropy)
 */
export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Hash a token using SHA-256
 * Used to store tokens securely in the database
 * @param token - The raw token to hash
 * @returns SHA-256 hash of the token as hex string
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Generate a token pair (raw token and its hash)
 * The raw token is sent to the user, the hash is stored in the database
 */
export function generateTokenPair(): { token: string; tokenHash: string } {
  const token = generateToken();
  const tokenHash = hashToken(token);
  return { token, tokenHash };
}

/**
 * Calculate expiration date for magic links (24 hours from now)
 */
export function getMagicLinkExpiry(): Date {
  const hours = parseInt(process.env.MAGIC_LINK_EXPIRY_HOURS || "24", 10);
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

/**
 * Calculate expiration date for sessions (7 days from now)
 */
export function getSessionExpiry(): Date {
  const days = parseInt(process.env.SESSION_DURATION_DAYS || "7", 10);
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

/**
 * Check if a date is in the past (expired)
 */
export function isExpired(date: Date): boolean {
  return date.getTime() < Date.now();
}
