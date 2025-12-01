# API Contracts: Magic Link API Protection

**Feature**: 005-access-control
**Date**: 2025-11-30

## Endpoints Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/access/request` | Public | Submit access request |
| GET | `/api/access/approve/[token]` | Token | Admin approves request |
| GET | `/api/access/reject/[token]` | Token | Admin rejects request |
| GET | `/api/auth/magic/[token]` | Token | Consume magic link |
| POST | `/api/auth/logout` | Session | End session |
| GET | `/api/auth/session` | Public | Check session status |
| POST | `/api/chat` | **Protected** | Chat with AI (LLM-consuming) |

---

## POST /api/access/request

Submit a new access request for protected API endpoints.

### Request

```typescript
interface AccessRequestBody {
  email: string;  // Valid email format
}
```

### Responses

**201 Created** - Request submitted successfully
```typescript
interface AccessRequestSuccess {
  message: string;  // "Access request submitted. You will receive an email when approved."
}
```

**400 Bad Request** - Invalid email format
```typescript
interface ValidationError {
  error: string;  // "Invalid email format"
}
```

**409 Conflict** - Pending request exists
```typescript
interface DuplicateError {
  error: string;  // "An access request is already pending for this email"
}
```

**500 Internal Server Error** - System error (e.g., email delivery failure)
```typescript
interface ServerError {
  error: string;  // "Unable to process request. Please try again later."
}
```

### Side Effects
- Creates AccessRequest record with status PENDING
- Sends email to ADMIN_EMAIL with approve/reject links

---

## GET /api/access/approve/[token]

Admin approves an access request via tokenized link.

### URL Parameters
- `token`: The approval token from admin email (64-char hex)

### Responses

**302 Found** - Redirects to confirmation page
```
Location: /auth/admin-action?status=approved&email={email}
```

**400 Bad Request** - Invalid or already-used token
```typescript
interface TokenError {
  error: string;  // "Invalid or expired approval link"
}
```

**404 Not Found** - Request not found or not pending
```typescript
interface NotFoundError {
  error: string;  // "Access request not found"
}
```

### Side Effects
- Updates AccessRequest status to APPROVED
- Creates MagicLink for user
- Sends magic link email to user

---

## GET /api/access/reject/[token]

Admin rejects an access request via tokenized link.

### URL Parameters
- `token`: The rejection token from admin email (64-char hex)

### Responses

**302 Found** - Redirects to confirmation page
```
Location: /auth/admin-action?status=rejected&email={email}
```

**400 Bad Request** - Invalid or already-used token
```typescript
interface TokenError {
  error: string;  // "Invalid or expired rejection link"
}
```

**404 Not Found** - Request not found or not pending
```typescript
interface NotFoundError {
  error: string;  // "Access request not found"
}
```

### Side Effects
- Updates AccessRequest status to REJECTED
- No email sent to user

---

## GET /api/auth/magic/[token]

Consume a magic link and create a session.

### URL Parameters
- `token`: The magic link token from user email (64-char hex)

### Responses

**302 Found** - Successful authentication, redirects to main app
```
Location: /
Set-Cookie: session_token=<token>; HttpOnly; Secure; SameSite=Lax; Max-Age=604800
```

**302 Found** - Invalid/expired/used token, redirects to error page
```
Location: /auth/error?reason=expired
Location: /auth/error?reason=used
Location: /auth/error?reason=invalid
```

### Side Effects
- Marks MagicLink as used (sets usedAt)
- Creates Session record
- Sets session cookie

---

## POST /api/auth/logout

End the current session.

### Request Headers
- `Cookie: session_token=<token>`

### Responses

**200 OK** - Session ended
```typescript
interface LogoutSuccess {
  message: string;  // "Logged out successfully"
}
Set-Cookie: session_token=; HttpOnly; Secure; SameSite=Lax; Max-Age=0
```

**401 Unauthorized** - No valid session
```typescript
interface UnauthorizedError {
  error: string;  // "Not authenticated"
}
```

### Side Effects
- Deletes Session record
- Clears session cookie

---

## GET /api/auth/session

Check if current session is valid. **This endpoint is public** to allow the UI to check auth status.

### Request Headers
- `Cookie: session_token=<token>` (optional)

### Responses

**200 OK** - Valid session
```typescript
interface SessionInfo {
  authenticated: true;
  email: string;
  expiresAt: string;  // ISO 8601 datetime
}
```

**200 OK** - No valid session (not an error - public endpoint)
```typescript
interface UnauthenticatedInfo {
  authenticated: false;
}
```

---

## POST /api/chat (PROTECTED)

**This is the existing chat endpoint - protected by middleware.**

### Request Headers
- `Cookie: session_token=<token>` (required)

### Responses

**401 Unauthorized** - No valid session
```typescript
interface UnauthorizedError {
  error: string;  // "Authentication required"
  code: "UNAUTHORIZED";
  requestAccessUrl: string;  // "/access-request"
}
```

**200 OK** - Authenticated request proceeds normally
(existing chat response format)

---

## Error Response Format

All error responses follow this structure:

```typescript
interface ErrorResponse {
  error: string;      // Human-readable error message
  code?: string;      // Optional machine-readable error code
  details?: unknown;  // Optional additional details
}
```

---

## Cookie Specification

### session_token

| Attribute | Value |
|-----------|-------|
| Name | `session_token` |
| HttpOnly | `true` |
| Secure | `true` (production only) |
| SameSite | `Lax` |
| Path | `/` |
| Max-Age | `604800` (7 days) |

---

## Token Specifications

### Approval/Rejection Tokens
- Length: 64 characters (hex-encoded 32 bytes)
- Entropy: 256 bits
- Storage: SHA-256 hashed in database
- Lifetime: Valid until request is processed

### Magic Link Tokens
- Length: 64 characters (hex-encoded 32 bytes)
- Entropy: 256 bits
- Storage: SHA-256 hashed in database
- Lifetime: 24 hours from creation

### Session Tokens
- Length: 64 characters (hex-encoded 32 bytes)
- Entropy: 256 bits
- Storage: SHA-256 hashed in database
- Lifetime: 7 days from creation

---

## Middleware Protection

The Next.js middleware protects **only API endpoints** that consume LLM tokens:

```typescript
// middleware.ts matcher config
export const config = {
  matcher: ['/api/chat/:path*']
}
```

**Protected endpoints**: `/api/chat`, `/api/chat/*`
**Public pages**: All pages (/, /access-request, etc.)
**Public API**: `/api/access/*`, `/api/auth/*`
