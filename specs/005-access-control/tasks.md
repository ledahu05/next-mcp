# Tasks: Magic Link API Protection

**Input**: Design documents from `/specs/005-access-control/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api.md

**Tests**: Test tasks are NOT included (not explicitly requested in the feature specification).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root (per plan.md structure)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, database, and email service configuration

- [x] T001 Install Prisma and Resend dependencies via `npm install prisma @prisma/client resend`
- [x] T002 Initialize Prisma with SQLite provider via `npx prisma init --datasource-provider sqlite`
- [x] T003 Create Prisma schema with AccessRequest, MagicLink, Session models in `prisma/schema.prisma`
- [x] T004 Generate Prisma client and push schema via `npx prisma generate && npx prisma db push`
- [x] T005 [P] Create Prisma client singleton in `src/lib/db/prisma.ts`
- [x] T006 [P] Create Resend email service wrapper in `src/lib/email/resend.ts`
- [x] T007 [P] Update `.env.example` with required environment variables (DATABASE_URL, ADMIN_EMAIL, RESEND_API_KEY, NEXT_PUBLIC_APP_URL)
- [x] T008 [P] Add `prisma/dev.db` to `.gitignore`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core authentication utilities and middleware that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Create token generation utilities (256-bit entropy) in `src/lib/auth/tokens.ts`
- [x] T010 [P] Create session management utilities (cookie handling, validation) in `src/lib/auth/session.ts`
- [x] T011 [P] Create shared TypeScript interfaces for auth entities in `src/lib/auth/types.ts`
- [x] T012 Create Next.js middleware for API protection in `src/middleware.ts`
- [x] T013 [P] Create error response utilities for auth endpoints in `src/lib/auth/errors.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Public App Navigation (Priority: P1)

**Goal**: Any visitor can freely navigate the application without logging in. The app's pages, UI, and non-protected features are accessible to everyone by default.

**Independent Test**: Open the app in an incognito window and navigate through all pages without being prompted to log in.

### Implementation for User Story 1

- [x] T014 [US1] Verify middleware matcher ONLY includes `/api/chat/:path*` in `src/middleware.ts`
- [x] T015 [US1] Verify home page (/) loads without authentication check in `src/app/page.tsx`
- [x] T016 [US1] Ensure all existing pages remain publicly accessible (no auth wrappers)

**Checkpoint**: User Story 1 complete - all pages accessible without authentication

---

## Phase 4: User Story 2 - Access Request for Protected Endpoints (Priority: P1)

**Goal**: Users who want to use protected API endpoints submit their email address to request access and see a confirmation that their request is pending approval.

**Independent Test**: Submit an email on the access request form and verify the confirmation message appears.

### Implementation for User Story 2

- [x] T017 [P] [US2] Create access request page in `src/app/access-request/page.tsx`
- [x] T018 [P] [US2] Create AccessRequestForm component with email validation in `src/components/access-request-form.tsx`
- [x] T019 [US2] Create access request API endpoint (POST) in `src/app/api/access/request/route.ts`
- [x] T020 [US2] Implement admin notification email (approve/reject links) in access request endpoint
- [x] T021 [US2] Handle duplicate pending request edge case (409 Conflict response)

**Checkpoint**: User Story 2 complete - users can submit access requests, admin receives notification

---

## Phase 5: User Story 3 - Administrator Approves/Rejects Access (Priority: P1)

**Goal**: Administrator receives email notification with approve/reject links. Clicking approve sends the user a magic link; clicking reject denies access.

**Independent Test**: Trigger an access request, then click the approve/reject links in the admin email.

### Implementation for User Story 3

- [x] T022 [P] [US3] Create admin approval endpoint in `src/app/api/access/approve/[token]/route.ts`
- [x] T023 [P] [US3] Create admin rejection endpoint in `src/app/api/access/reject/[token]/route.ts`
- [x] T024 [US3] Implement magic link creation and email sending on approval
- [x] T025 [US3] Create admin action confirmation page in `src/app/auth/admin-action/page.tsx`
- [x] T026 [US3] Implement token validation and single-use logic for admin action tokens

**Checkpoint**: User Story 3 complete - admin can approve/reject requests, approved users receive magic links

---

## Phase 6: User Story 4 - User Authenticates via Magic Link (Priority: P1)

**Goal**: Approved user clicks magic link within 24 hours, authenticates, and receives a 7-day session.

**Independent Test**: Click a valid magic link and verify redirect to the chat page with an active session.

### Implementation for User Story 4

- [x] T027 [US4] Create magic link consumption endpoint in `src/app/api/auth/magic/[token]/route.ts`
- [x] T028 [US4] Implement session creation and cookie setting on successful magic link consumption
- [x] T029 [US4] Handle expired magic link (24-hour expiry) with redirect to error page
- [x] T030 [US4] Handle already-used magic link with redirect to error page
- [x] T031 [P] [US4] Create auth error page in `src/app/auth/error/page.tsx`
- [x] T032 [P] [US4] Create session status endpoint (GET) in `src/app/api/auth/session/route.ts`

**Checkpoint**: User Story 4 complete - users can authenticate via magic link and maintain sessions

---

## Phase 7: User Story 5 - Protected Endpoint Enforcement (Priority: P2)

**Goal**: The /api/chat endpoint is protected from unauthenticated access. Unauthenticated users receive clear error messages.

**Independent Test**: Attempt to call /api/chat without a session and verify the request is blocked.

### Implementation for User Story 5

- [x] T033 [US5] Implement session validation in middleware for `/api/chat` routes in `src/middleware.ts`
- [x] T034 [US5] Return 401 with `requestAccessUrl` in error response for unauthenticated API calls
- [x] T035 [P] [US5] Create AuthGate client component for chat UI in `src/components/auth-gate.tsx`
- [x] T036 [US5] Integrate AuthGate to show access request prompt for unauthenticated users in chat UI
- [x] T037 [US5] Allow authenticated users to access /api/chat normally (verify passthrough)

**Checkpoint**: User Story 5 complete - protected endpoint enforces authentication, UI shows appropriate messages

---

## Phase 8: User Story 6 - Session Logout (Priority: P3)

**Goal**: Authenticated users can log out, which ends their session immediately.

**Independent Test**: Click logout while authenticated and verify the session is terminated.

### Implementation for User Story 6

- [x] T038 [US6] Create logout endpoint (POST) in `src/app/api/auth/logout/route.ts`
- [x] T039 [US6] Implement session deletion from database on logout
- [x] T040 [US6] Clear session cookie on logout response
- [x] T041 [US6] Add logout button/functionality to UI (integrate with existing layout)

**Checkpoint**: User Story 6 complete - users can log out and session is terminated

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, environment validation, and cleanup

- [x] T042 [P] Add environment variable validation at startup (ADMIN_EMAIL required)
- [x] T043 [P] Handle session expiration (7-day) in session validation logic
- [x] T044 [P] Ensure Secure cookie flag is set in production (check NEXT_PUBLIC_APP_URL for https)
- [x] T045 Run quickstart.md verification checklist
- [x] T046 Verify all edge cases from spec.md are handled

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-8)**: All depend on Foundational phase completion
  - User stories can proceed in priority order (P1 → P2 → P3)
  - P1 stories (US1, US2, US3, US4) should complete before P2 (US5)
  - P2 (US5) should complete before P3 (US6)
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P1)**: Depends on US2 (needs AccessRequest records to approve/reject)
- **User Story 4 (P1)**: Depends on US3 (needs MagicLink records created by approval)
- **User Story 5 (P2)**: Depends on US4 (needs session mechanism working for passthrough test)
- **User Story 6 (P3)**: Depends on US4 (needs sessions to exist for logout)

### Within Each User Story

- Models/entities handled in Setup phase (Prisma schema)
- Services/utilities in Foundational phase
- API endpoints before UI components
- Core implementation before integration

### Parallel Opportunities

**Phase 1 Setup** (after T004):
```
T005 + T006 + T007 + T008 (all [P])
```

**Phase 2 Foundational** (after T009):
```
T010 + T011 + T013 (all [P])
```

**Phase 4 User Story 2**:
```
T017 + T018 (both [P] - page and component)
```

**Phase 5 User Story 3**:
```
T022 + T023 (both [P] - approve and reject endpoints)
```

**Phase 6 User Story 4**:
```
T031 + T032 (both [P] - error page and session endpoint)
```

**Phase 7 User Story 5**:
```
T035 can run parallel with T033/T034
```

**Phase 9 Polish**:
```
T042 + T043 + T044 (all [P])
```

---

## Parallel Example: Phase 1 Setup

```bash
# After T004 completes, launch these in parallel:
Task: "Create Prisma client singleton in src/lib/db/prisma.ts"
Task: "Create Resend email service wrapper in src/lib/email/resend.ts"
Task: "Update .env.example with required environment variables"
Task: "Add prisma/dev.db to .gitignore"
```

---

## Implementation Strategy

### MVP First (User Stories 1-4 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Public Navigation)
4. Complete Phase 4: User Story 2 (Access Request)
5. Complete Phase 5: User Story 3 (Admin Approval)
6. Complete Phase 6: User Story 4 (Magic Link Auth)
7. **STOP and VALIDATE**: Full authentication flow working
8. Deploy/demo if ready - users can request access and authenticate

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Pages publicly accessible (MVP baseline)
3. Add US2 → Users can request access
4. Add US3 → Admin can approve/reject
5. Add US4 → Users can authenticate (MVP complete!)
6. Add US5 → Protected endpoints enforced
7. Add US6 → Logout functionality
8. Polish → Production hardening

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- US1-US4 are all P1 priority - complete these for MVP
- US5 (P2) adds enforcement - important but MVP works without strict enforcement
- US6 (P3) is nice-to-have - authentication expires anyway
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
