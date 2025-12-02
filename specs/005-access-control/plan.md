# Implementation Plan: Magic Link API Protection

**Branch**: `005-access-control` | **Date**: 2025-11-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-access-control/spec.md`

## Summary

Implement a magic link-based access control system to protect LLM-consuming API endpoints while keeping the application publicly accessible. The system uses email-based authentication where users request access, an administrator approves/rejects via email links, and approved users receive single-use magic links valid for 24 hours. Sessions persist for 7 days using HttpOnly cookies. Only API endpoints that consume LLM tokens (/api/chat) are protected via Next.js middleware - all pages and UI remain publicly accessible.

## Technical Context

**Language/Version**: TypeScript 5.x (Strict mode)
**Primary Dependencies**: Next.js 14+ (App Router), Prisma ORM, Resend email service
**Storage**: SQLite (file-based via Prisma)
**Testing**: Vitest (existing project setup)
**Target Platform**: Vercel (serverless)
**Project Type**: Web application (Next.js)
**Performance Goals**: Standard web app latency (<500ms for auth operations)
**Constraints**: Serverless-compatible, no persistent connections
**Scale/Scope**: PoC scale (~100 users), single admin

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Status |
|-----------|-------------|--------|
| I. Serverless-First | Use Next.js API Routes | ✅ All auth endpoints via App Router |
| II. MCP Protocol | N/A for auth feature | ✅ N/A |
| III. Type Safety | TypeScript strict, no `any` | ✅ Will define interfaces for all entities |
| IV. Component Standards | Functional components, Shadcn UI | ✅ Access request form uses Shadcn |
| V. Graceful Error Handling | Toast notifications, Try/Catch | ✅ Error pages and toast feedback |
| VI. Authentication | Session validation, secure cookies, 256-bit entropy, single-use tokens, public-by-default | ✅ Core feature - pages public, only LLM API protected |

**Gate Status**: ✅ PASS - All principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/005-access-control/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api.md           # REST API contracts
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── access-request/
│   │   └── page.tsx           # Public access request form
│   ├── auth/
│   │   ├── error/
│   │   │   └── page.tsx       # Magic link error page
│   │   └── admin-action/
│   │       └── page.tsx       # Admin action confirmation page
│   ├── api/
│   │   ├── access/
│   │   │   ├── request/
│   │   │   │   └── route.ts   # POST - submit access request
│   │   │   ├── approve/
│   │   │   │   └── [token]/
│   │   │   │       └── route.ts  # GET - admin approves
│   │   │   └── reject/
│   │   │       └── [token]/
│   │   │           └── route.ts  # GET - admin rejects
│   │   ├── auth/
│   │   │   ├── magic/
│   │   │   │   └── [token]/
│   │   │   │       └── route.ts  # GET - consume magic link
│   │   │   ├── logout/
│   │   │   │   └── route.ts      # POST - end session
│   │   │   └── session/
│   │   │       └── route.ts      # GET - check session status
│   │   └── chat/
│   │       └── route.ts          # PROTECTED - existing chat endpoint
│   └── page.tsx                   # Public home page (unchanged)
├── components/
│   ├── access-request-form.tsx    # Email submission form
│   └── auth-gate.tsx              # Client component for chat UI auth check
├── lib/
│   ├── auth/
│   │   ├── session.ts            # Session management utilities
│   │   └── tokens.ts             # Token generation utilities
│   ├── db/
│   │   └── prisma.ts             # Prisma client singleton
│   └── email/
│       └── resend.ts             # Email service wrapper
├── middleware.ts                  # API-only route protection
└── prisma/
    └── schema.prisma              # Database schema

tests/
├── integration/
│   └── auth/                      # Auth flow integration tests
└── unit/
    └── lib/
        └── auth/                  # Token/session unit tests
```

**Structure Decision**: Next.js App Router structure following existing project conventions. Auth-related code organized under `lib/auth/` for utilities, `app/api/` for endpoints. **Key design: Middleware only protects API routes (`/api/chat`), not pages.**

## Complexity Tracking

> No constitution violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | - | - |
