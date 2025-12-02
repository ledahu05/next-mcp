# Data Model: Magic Link API Protection

**Feature**: 005-access-control
**Date**: 2025-11-30

## Entities

### AccessRequest

Represents a user's request to gain access to protected API endpoints.

| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| email | String | User's email address (unique per pending request) |
| status | Enum | `PENDING`, `APPROVED`, `REJECTED` |
| approveToken | String | Hashed token for admin approval link |
| rejectToken | String | Hashed token for admin rejection link |
| createdAt | DateTime | When request was submitted |
| updatedAt | DateTime | When status last changed |

**Validation Rules**:
- Email must be valid format
- Only one PENDING request per email at a time
- approveToken and rejectToken are unique, hashed

**State Transitions**:
```
PENDING → APPROVED (admin clicks approve link)
PENDING → REJECTED (admin clicks reject link)
```

---

### MagicLink

Represents a single-use authentication token sent to approved users.

| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| tokenHash | String | SHA-256 hash of the token (unique) |
| email | String | Associated user email |
| expiresAt | DateTime | When the link expires (24 hours from creation) |
| usedAt | DateTime? | When the link was consumed (null if unused) |
| createdAt | DateTime | When the link was created |

**Validation Rules**:
- tokenHash must be unique
- Link is valid only if: `usedAt` is null AND `expiresAt` > now

**State Transitions**:
```
VALID (created) → USED (consumed successfully)
VALID (created) → EXPIRED (expiresAt passed without use)
```

---

### Session

Represents an authenticated user's active session for accessing protected API endpoints.

| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| tokenHash | String | SHA-256 hash of session token (unique) |
| email | String | Associated user email |
| expiresAt | DateTime | When session expires (7 days from creation) |
| createdAt | DateTime | When session was created |

**Validation Rules**:
- tokenHash must be unique
- Session is valid only if: `expiresAt` > now

**State Transitions**:
```
ACTIVE (created) → EXPIRED (expiresAt passed)
ACTIVE (created) → TERMINATED (user logs out - record deleted)
```

---

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

enum RequestStatus {
  PENDING
  APPROVED
  REJECTED
}

model AccessRequest {
  id           String        @id @default(cuid())
  email        String
  status       RequestStatus @default(PENDING)
  approveToken String        @unique
  rejectToken  String        @unique
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  @@unique([email, status], name: "unique_pending_email")
}

model MagicLink {
  id        String    @id @default(cuid())
  tokenHash String    @unique
  email     String
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime  @default(now())
}

model Session {
  id        String   @id @default(cuid())
  tokenHash String   @unique
  email     String
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

---

## Relationships

```
AccessRequest (1) --creates--> (0..1) MagicLink
  When approved, a MagicLink is created for the same email

MagicLink (1) --creates--> (0..1) Session
  When consumed, a Session is created for the same email

Session (1) --> Protected API Access
  Valid session grants access to /api/chat and other LLM-consuming endpoints
```

---

## Indexes

| Table | Index | Purpose |
|-------|-------|---------|
| AccessRequest | email + status | Find pending requests by email |
| AccessRequest | approveToken | Lookup for admin approval |
| AccessRequest | rejectToken | Lookup for admin rejection |
| MagicLink | tokenHash | Lookup for magic link consumption |
| MagicLink | email + expiresAt | Find valid links for user |
| Session | tokenHash | Lookup for session validation |
| Session | email | Find sessions by user |

---

## Data Lifecycle

### Cleanup Strategy

1. **Expired MagicLinks**: Delete where `expiresAt < now()` and `usedAt IS NULL`
2. **Used MagicLinks**: Can delete immediately after consumption or retain for audit
3. **Expired Sessions**: Delete where `expiresAt < now()`
4. **Old AccessRequests**: Retain for audit, optionally purge after 30 days

### Retention Considerations

- **AccessRequests**: Keep for audit trail (who requested, when, outcome)
- **MagicLinks**: Delete after use to prevent forensic exposure
- **Sessions**: Delete on logout or expiration
