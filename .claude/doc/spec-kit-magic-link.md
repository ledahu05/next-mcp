# Plan: Magic Link Feature with SpecKit Spec-Driven Development

## Summary

This plan provides the exact prompts and constitution updates needed to implement the magic-link access control feature using speckit's spec-driven development workflow.

---

## 1. Constitution Update (for `/speckit.constitution`)

**Prompt for `/speckit.constitution`**:

```
Add Principle VI: Authentication & Access Control

- All protected endpoint MUST verify session validity before processing requests.
- All endpoint involving the use of LLM token should be protected
- All other routes on the frontend and endpoint that do not consumme LLM tokens should be public
- Sessions MUST use HttpOnly, Secure (in production), and SameSite cookies.
- Authentication tokens MUST be cryptographically secure (minimum 256-bit entropy).
- Magic links and tokens MUST be single-use and time-limited.
- Silent authentication failures are prohibited - users MUST receive clear feedback.

Rationale: Secure access control protects Gemini API tokens from unauthorized usage while maintaining a simple admin-approval workflow for the proof-of-concept.
```

**Note**: Tech stack additions (SQLite/Prisma, Resend) will be documented in the feature's implementation plan, not in the constitution.

---

## 2. Prompt for `/speckit.specify`

```
I want to implement an access control system to protect the AI calculator from unauthorized usage.

The system should:
- Allow new users to request access to protected route or protected endpoint by submitting their email address
- All endpoint that use LLM tokens should be protected
- All other routes or endpoint should be public by default unless they are declared private
- Notify an administrator when someone requests access
- Allow the administrator to approve or reject access requests
- Send approved users a time-limited magic link (valid for 24 hours) to access the application
- Maintain user sessions (valid for 7 days) so they don't need to re-authenticate frequently
- Redirect unauthenticated users that tries to access a protected route or use a protected endpoint to the access request page
- Protect all AI chat endpoints from unauthenticated access
- Should be able to create an administrator account with the email christophe.seguinot@gmail.com
- Should be testable both locally and in production

Edge cases and security requirements:
- Magic links must be single-use (consumed and invalidated after first use)
- If a magic link expires before being used, the user must submit a new access request from scratch
- If a user tries to access a protected page without a valid session, they should be redirected to the access request page
- The admin should only receive notifications for new access requests (not duplicates from the same email)

The goal is to limit Gemini API token usage to only approved users while keeping the onboarding experience simple and passwordless.
```

---

## 3. Prompt for `/speckit.plan`

```
I am building with:
- Next.js 14+ (App Router) for the framework
- TypeScript strict mode
- SQLite + Prisma for the database (simple file-based persistence)
- Resend for transactional emails
- HttpOnly cookies for secure session management
- crypto.randomBytes(32) for token generation (256-bit entropy)

Key technical decisions:
- Magic links valid for 24 hours
- Sessions valid for 7 days
- Magic links are single-use (deleted after consumption)
- If a magic link expires, the user must request access again
- Admin email is hardcoded via environment variable
- Middleware-based route protection for / and /api/chat
```

---

## Execution Order

1. **First**: Run `/speckit.constitution` with the Principle VI addition
2. **Second**: Run `/speckit.specify` with the feature description prompt
3. **Third**: Run `/speckit.plan` with the tech stack prompt
4. **Fourth**: Run `/speckit.tasks` to generate implementation tasks
5. **Fifth**: Run `/speckit.implement` to execute the tasks

---

## Files That Will Be Modified

| File                                           | Purpose                              |
| ---------------------------------------------- | ------------------------------------ |
| `.specify/memory/constitution.md`              | Add Principle VI for authentication  |
| `specs/XXX-magic-link-auth/spec.md`            | Feature specification (auto-created) |
| `specs/XXX-magic-link-auth/plan.md`            | Implementation plan (auto-created)   |
| `src/middleware.ts`                            | New - route protection               |
| `src/app/api/access/request/route.ts`          | New - access request endpoint        |
| `src/app/api/access/validate/[token]/route.ts` | New - admin validation               |
| `src/app/api/auth/magic/[token]/route.ts`      | New - magic link login               |
| `src/app/api/auth/session/route.ts`            | New - session check                  |
| `src/app/access-request/page.tsx`              | New - public request form            |
| `src/lib/auth/*.ts`                            | New - session and token utilities    |
| `src/lib/db/prisma.ts`                         | New - Prisma client                  |
| `src/lib/email/resend.ts`                      | New - email service                  |
| `prisma/schema.prisma`                         | New - database schema                |
| `src/app/api/chat/route.ts`                    | Modified - add auth check            |
| `src/app/page.tsx`                             | Modified - add redirect              |

import { Resend } from 'resend';

const resend = new Resend('re_LasuC4XG_NUVANPGxrbPzGj5KyYB2ARXL');

resend.emails.send({
from: 'onboarding@resend.dev',
to: 'christophe.seguinot@gmail.com',
subject: 'Hello World',
html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
});
