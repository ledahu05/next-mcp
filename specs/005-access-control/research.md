# Research: Magic Link API Protection

**Feature**: 005-access-control
**Date**: 2025-11-30

## Technology Decisions

### 1. Database: SQLite + Prisma

**Decision**: Use SQLite with Prisma ORM for data persistence.

**Rationale**:
- SQLite is file-based, requiring no separate database server
- Prisma provides type-safe database access aligned with TypeScript strict mode
- Perfect for PoC scale (~100 users)
- Vercel supports SQLite via Turso or local file (for development)

**Alternatives Considered**:
- PostgreSQL: Overkill for PoC, requires external service
- In-memory storage: Data lost on serverless cold starts
- JSON file: No ACID guarantees, race conditions

**Implementation Notes**:
- Use Prisma singleton pattern for serverless compatibility
- Database file stored at `prisma/dev.db` (gitignored)
- Production: Consider Turso for SQLite-compatible serverless DB

---

### 2. Email Service: Resend

**Decision**: Use Resend for transactional emails.

**Rationale**:
- Simple API, excellent developer experience
- Free tier sufficient for PoC (100 emails/day)
- First-class TypeScript support
- No domain verification required for testing (uses sandbox)

**Alternatives Considered**:
- SendGrid: More complex setup, overkill for PoC
- Nodemailer + SMTP: Requires SMTP server configuration
- AWS SES: Requires AWS account setup, domain verification

**Implementation Notes**:
- Environment variable: `RESEND_API_KEY`
- Sandbox mode for local development
- Production: Verify domain for better deliverability

---

### 3. Token Generation: crypto.randomBytes(32)

**Decision**: Use Node.js `crypto.randomBytes(32)` for all tokens.

**Rationale**:
- 256-bit entropy meets constitution requirement
- Cryptographically secure random number generation
- No external dependencies
- URL-safe encoding via hex or base64url

**Alternatives Considered**:
- UUID v4: Only 122 bits of randomness
- nanoid: External dependency, less entropy by default
- JWT: Unnecessary complexity for single-use tokens

**Implementation Notes**:
- Generate as hex string (64 characters) for URL safety
- Store hashed version in database for security
- Original token only in email, never stored

---

### 4. Session Management: HttpOnly Cookies

**Decision**: Use HttpOnly cookies with server-side session storage.

**Rationale**:
- Constitution mandates HttpOnly, Secure, SameSite cookies
- Server-side session allows easy invalidation
- No client-side token storage vulnerabilities

**Alternatives Considered**:
- JWT in cookie: Cannot invalidate individual sessions
- localStorage: XSS vulnerable, not HttpOnly
- Session ID only (no server storage): Cannot track active sessions

**Implementation Notes**:
- Cookie name: `session_token`
- Cookie settings: `HttpOnly`, `Secure` (prod), `SameSite=Lax`
- Session ID stored in database with expiration timestamp
- 7-day expiration with sliding window optional

---

### 5. Route Protection: Next.js Middleware (API-Only)

**Decision**: Use Next.js middleware to protect **only API endpoints** that consume LLM tokens.

**Rationale**:
- Constitution Principle VI: "All other routes and endpoints that do not consume LLM tokens SHOULD be public"
- Spec requirement FR-001: "System MUST allow all users to navigate the app freely without authentication"
- Middleware runs before route handlers, ensuring protection
- Single configuration point for protected API routes

**Key Design Point**:
- **Protected**: `/api/chat` (LLM-consuming)
- **Public**: All pages (`/`, `/access-request`, etc.)
- **Public**: Auth endpoints (`/api/access/*`, `/api/auth/*`)

**Alternatives Considered**:
- Page-level protection: Violates public-by-default requirement
- Per-route auth checks: Easy to miss routes, repetitive
- Higher-order components: Client-side only, not secure for API

**Implementation Notes**:
- Middleware at `src/middleware.ts`
- Matcher config: `["/api/chat/:path*"]`
- Returns 401 JSON error for unauthenticated API calls
- Does NOT redirect pages (pages are public)

---

### 6. UI Authentication Gate

**Decision**: Use a client-side component to check auth status before showing chat UI.

**Rationale**:
- Pages remain publicly accessible (can view, browse)
- Chat functionality requires auth - show access request prompt if not authenticated
- Graceful degradation rather than hard blocks

**Implementation Notes**:
- `AuthGate` component wraps chat UI
- Checks `/api/auth/session` on mount
- Shows access request prompt if not authenticated
- Shows chat UI if authenticated

---

### 7. Admin Identification: Environment Variable

**Decision**: Identify admin via `ADMIN_EMAIL` environment variable.

**Rationale**:
- Simplest approach for single-admin PoC
- No admin account management needed
- Easy to change without code deployment

**Alternatives Considered**:
- Admin table in database: Overkill for single admin
- Role-based access: Unnecessary complexity
- Hardcoded email: Not configurable

**Implementation Notes**:
- Environment variable: `ADMIN_EMAIL`
- Startup validation: Error if not set
- No admin authentication required (links are tokenized)

---

## Security Considerations

### Token Hashing

Store only hashed versions of tokens in the database:
- Hash algorithm: SHA-256
- Original token sent via email
- Lookup by hash on token consumption
- Prevents token exposure if database compromised

### Rate Limiting

Consider adding rate limiting for:
- Access request submissions (prevent spam)
- Magic link consumption (prevent brute force)
- Implementation: Can use Vercel's built-in rate limiting or `@upstash/ratelimit`

### Token Expiration Cleanup

Implement periodic cleanup of expired tokens:
- Prisma scheduled jobs or on-demand cleanup
- Remove expired magic links and sessions
- Prevents database bloat

---

## Environment Variables Required

```env
# Required
ADMIN_EMAIL=admin@example.com
RESEND_API_KEY=re_xxxxx
DATABASE_URL=file:./dev.db

# Optional (defaults shown)
NEXT_PUBLIC_APP_URL=http://localhost:3000
SESSION_DURATION_DAYS=7
MAGIC_LINK_EXPIRY_HOURS=24
```

---

## Dependencies to Install

```bash
npm install prisma @prisma/client resend
npm install -D @types/node
```

Prisma is the only new major dependency. Resend is lightweight (~10KB).
