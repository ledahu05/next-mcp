# Plan: Magic Link Feature with SpecKit Spec-Driven Development

## Summary

This plan provides the exact prompts and constitution updates needed to implement the magic-link access control feature using speckit's spec-driven development workflow.

---

## 1. Constitution Update (for `/speckit.constitution`)

**Prompt for `/speckit.constitution`**:

```
Add Principle VI: Authentication & Access Control

- All protected endpoints MUST verify session validity before processing requests.
- All endpoints involving the use of LLM tokens MUST be protected.
- All other routes and endpoints that do not consume LLM tokens SHOULD be public.
- Sessions MUST use HttpOnly, Secure (in production), and SameSite cookies.
- Authentication tokens MUST be cryptographically secure (minimum 256-bit entropy).
- Silent authentication failures are prohibited - users MUST receive clear feedback.

Rationale: Secure access control protects Gemini API tokens from unauthorized usage while maintaining a simple admin-approval workflow for the proof-of-concept.
```

**Note**: Tech stack additions (SQLite/Prisma, Resend) will be documented in the feature's implementation plan, not in the constitution.

---

## 2. Prompt for `/speckit.specify`

```
I want to implement an access control system to protect the usage of protected api endpoint.

The system should:
- allow Access to the app for unauthorized used. The app is public and therefore no authorization or login are requirement to navigate throught the app by default
- Protect all endpoints that consume LLM tokens (currently only /api/chat)
- For example, an anonymous user can access the chat page, can click on the send button, but the API will returns a forbidden that will trigger the authentication workflow
- Keep all other routes and endpoints public by default
- Allow new users to request access by submitting their email address and password in order to be granted to use protected endpoints
- Send an email notification to the administrator when someone requests access
- Send to the administrator via email a magic link that the administrator can forward to the user.
- When clicking on the magic link sent by the administrator personnaly, the user is granted to access the protected endpoint
- It is a time-limited magic link (valid for 24 hours) to access the application
- After successful magic link authentication, redirect users to the main chat page (/)
- Maintain user sessions (valid for 7 days) so they don't need to re-authenticate frequently
- Redirect unauthenticated users that try to run protected endpoints to the access request page
- Use an environment variable (ADMIN_EMAIL) to identify the administrator (no admin account creation needed)
- Be testable both locally and in production

Edge cases and security requirements:
- Magic links must be single-use (consumed and invalidated after first use)
- If a user clicks an expired or already-used magic link, show a clear error page with a link to request access again
- If a magic link expires before being used, the user must submit a new access request
- If a user tries to access a protected page without a valid session, redirect them to the access request page
- If the same email submits multiple access requests while one is pending, ignore the duplicate and show a message that a request is already pending
- Users can log out to end their session early (optional logout button)

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
- Admin identified via ADMIN_EMAIL environment variable (no database record)
- Admin approves/rejects via tokenized email links
- Middleware-based route protection for all LLM-consuming endpoints (currently: /, /api/chat)
- Successful authentication redirects to /
- Expired/used magic links show an error page with instructions
```

---

## Execution Order

1. **First**: Run `/speckit.constitution` with the Principle VI addition
2. **Second**: Run `/speckit.specify` with the feature description prompt
3. **Third**: Run `/speckit.plan` with the tech stack prompt
4. **Fourth**: Run `/speckit.tasks` to generate implementation tasks
5. **Fifth**: Run `/speckit.implement` to execute the tasks

---

## Files That Will Be Created/Modified

| File                                          | Purpose                              |
| --------------------------------------------- | ------------------------------------ |
| `.specify/memory/constitution.md`             | Add Principle VI for authentication  |
| `specs/XXX-magic-link-auth/spec.md`           | Feature specification (auto-created) |
| `specs/XXX-magic-link-auth/plan.md`           | Implementation plan (auto-created)   |
| `src/middleware.ts`                           | New - route protection               |
| `src/app/api/access/request/route.ts`         | New - access request endpoint        |
| `src/app/api/access/approve/[token]/route.ts` | New - admin approval link handler    |
| `src/app/api/access/reject/[token]/route.ts`  | New - admin rejection link handler   |
| `src/app/api/auth/magic/[token]/route.ts`     | New - magic link login               |
| `src/app/api/auth/logout/route.ts`            | New - session logout                 |
| `src/app/api/auth/session/route.ts`           | New - session check                  |
| `src/app/access-request/page.tsx`             | New - public request form            |
| `src/app/auth/error/page.tsx`                 | New - expired/used link error page   |
| `src/lib/auth/*.ts`                           | New - session and token utilities    |
| `src/lib/db/prisma.ts`                        | New - Prisma client                  |
| `src/lib/email/resend.ts`                     | New - email service                  |
| `prisma/schema.prisma`                        | New - database schema                |
| `src/app/api/chat/route.ts`                   | Modified - add auth check            |
| `src/app/page.tsx`                            | Modified - add redirect logic        |
