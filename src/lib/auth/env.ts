/**
 * Environment variable validation for auth system
 * Called at startup to ensure required configuration is present
 */

export function validateAuthEnv(): void {
  const requiredVars = ["ADMIN_EMAIL", "RESEND_API_KEY"];

  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    console.error(
      `[Auth] Missing required environment variables: ${missing.join(", ")}`
    );
    console.error(
      "[Auth] Please check your .env file. See .env.example for reference."
    );
  }

  // Warn about optional but recommended vars
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    console.warn(
      "[Auth] NEXT_PUBLIC_APP_URL not set - defaulting to http://localhost:3000"
    );
  }
}

/**
 * Get admin email with validation
 */
export function getAdminEmail(): string | null {
  const email = process.env.ADMIN_EMAIL;
  if (!email) {
    console.error("[Auth] ADMIN_EMAIL not configured");
    return null;
  }
  return email;
}

/**
 * Check if auth system is properly configured
 */
export function isAuthConfigured(): boolean {
  return Boolean(process.env.ADMIN_EMAIL && process.env.RESEND_API_KEY);
}
