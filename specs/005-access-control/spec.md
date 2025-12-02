# Feature Specification: Magic Link API Protection

**Feature Branch**: `005-access-control`
**Created**: 2025-11-30
**Status**: Draft
**Input**: User description: "Implement access control system to protect LLM-consuming API endpoints while keeping the app publicly accessible"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Public App Navigation (Priority: P1)

Any visitor can freely navigate the application without logging in or authenticating. The app's pages, UI, and non-protected features are accessible to everyone by default.

**Why this priority**: This is the foundational expectation - the app must remain publicly accessible for browsing. Protection only applies to specific API endpoints.

**Independent Test**: Can be fully tested by opening the app in an incognito window and navigating through all pages without being prompted to log in.

**Acceptance Scenarios**:

1. **Given** any visitor (authenticated or not), **When** they navigate to the home page (/), **Then** the page loads normally without any login requirement.
2. **Given** an unauthenticated visitor, **When** they browse through the app's UI, **Then** all pages and navigation work normally.
3. **Given** an unauthenticated visitor, **When** they try to use a protected API endpoint (e.g., /api/chat), **Then** they receive an error response indicating authentication is required.

---

### User Story 2 - Access Request for Protected Endpoints (Priority: P1)

A user who wants to use protected API endpoints (like the AI chat) submits their email address to request access. They see a confirmation that their request is pending approval.

**Why this priority**: This is the entry point for users who want to use LLM-powered features. Without this, no one can gain access to protected endpoints.

**Independent Test**: Can be fully tested by submitting an email on the access request form and verifying the confirmation message appears.

**Acceptance Scenarios**:

1. **Given** a user wants to use the AI chat, **When** they navigate to the access request page, **Then** they see a simple form to enter their email.
2. **Given** a user is on the access request page, **When** they enter a valid email and submit, **Then** they see a confirmation message that their request is pending.
3. **Given** a user submits an access request, **When** the request is recorded, **Then** the administrator receives an email notification with approve/reject links.

---

### User Story 3 - Administrator Approves/Rejects Access (Priority: P1)

An administrator receives an email notification when a user requests access. The email contains approve and reject links. Clicking approve sends the user a magic link; clicking reject denies access.

**Why this priority**: Without admin approval flow, no users can gain access to protected endpoints.

**Independent Test**: Can be fully tested by triggering an access request, then clicking the approve/reject links in the admin email.

**Acceptance Scenarios**:

1. **Given** an administrator receives an access request notification, **When** they click the approve link, **Then** the user's status changes to approved and a magic link is sent to the user.
2. **Given** an administrator receives an access request notification, **When** they click the reject link, **Then** the user's request is marked as rejected and no magic link is sent.
3. **Given** an approval link is clicked, **When** the magic link email is sent, **Then** the administrator sees a confirmation page indicating the action was successful.

---

### User Story 4 - User Authenticates via Magic Link (Priority: P1)

An approved user receives a magic link email. They click the link within 24 hours, which authenticates them and redirects them to the main chat page. A session is created that keeps them authenticated for 7 days.

**Why this priority**: This completes the authentication flow, allowing approved users to access protected endpoints.

**Independent Test**: Can be fully tested by clicking a valid magic link and verifying redirect to the chat page with an active session.

**Acceptance Scenarios**:

1. **Given** a user has a valid magic link, **When** they click it within 24 hours, **Then** they are authenticated and redirected to the main chat page (/).
2. **Given** a user is authenticated, **When** they return to the application within 7 days, **Then** they remain authenticated without needing to re-authenticate.
3. **Given** a user has used a magic link, **When** they try to use the same link again, **Then** they see an error page explaining the link has already been used.

---

### User Story 5 - Protected Endpoint Enforcement (Priority: P2)

The AI chat API endpoint is protected from unauthenticated access. Any attempt to call the endpoint without a valid session returns an error with guidance to request access.

**Why this priority**: Essential for the security goal but depends on the authentication system being in place first.

**Independent Test**: Can be fully tested by attempting to call /api/chat without a session and verifying the request is blocked.

**Acceptance Scenarios**:

1. **Given** an unauthenticated user, **When** they try to call the /api/chat endpoint directly, **Then** they receive an error response indicating authentication is required.
2. **Given** an unauthenticated user, **When** they try to use the chat feature in the UI, **Then** they are shown a message directing them to request access.
3. **Given** an authenticated user with a valid session, **When** they call /api/chat, **Then** the request proceeds normally.

---

### User Story 6 - Session Logout (Priority: P3)

An authenticated user can choose to log out, which ends their session immediately. After logging out, they must request access again to use protected endpoints.

**Why this priority**: Nice-to-have feature for user control but not essential for core functionality.

**Independent Test**: Can be fully tested by clicking logout while authenticated and verifying the session is terminated.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they click the logout button, **Then** their session is terminated.
2. **Given** a user has logged out, **When** they try to use protected endpoints, **Then** they receive an authentication error.

---

### Edge Cases

- What happens when a user clicks an expired magic link (older than 24 hours)?
  - Show an error page explaining the link has expired with a link to request access again.

- What happens when a user clicks an already-used magic link?
  - Show an error page explaining the link has already been used with a link to request access again.

- What happens when the same email submits multiple access requests while one is pending?
  - Ignore the duplicate and show a message that a request is already pending for this email.

- What happens when a session expires after 7 days?
  - The next protected API call returns an authentication error; the user must request access again.

- What happens if the admin email environment variable is not set?
  - Log an error and prevent access requests from being processed (system configuration error).

- What happens when a user whose request was rejected tries to request access again?
  - Allow the new request (previous rejection doesn't block future requests).

- What happens when an unauthenticated user tries to use the chat UI?
  - The UI displays a message explaining they need to request access, with a link to the access request form.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow all users to navigate the app freely without authentication.
- **FR-002**: System MUST protect API endpoints that consume LLM tokens (currently /api/chat) from unauthenticated access.
- **FR-003**: System MUST allow users to submit access requests using only their email address.
- **FR-004**: System MUST validate that submitted email addresses are in a valid format.
- **FR-005**: System MUST send an email notification to the administrator when a new access request is submitted.
- **FR-006**: System MUST provide the administrator with approve and reject links in the notification email.
- **FR-007**: System MUST send a magic link email to users when their access request is approved.
- **FR-008**: System MUST enforce magic link expiration after 24 hours.
- **FR-009**: System MUST invalidate magic links after first use (single-use).
- **FR-010**: System MUST create a session upon successful magic link authentication.
- **FR-011**: System MUST maintain sessions for 7 days before requiring re-authentication.
- **FR-012**: System MUST return an authentication error when unauthenticated users call protected endpoints.
- **FR-013**: System MUST identify the administrator via the ADMIN_EMAIL environment variable.
- **FR-014**: System MUST prevent duplicate access requests from the same email while a request is pending.
- **FR-015**: System MUST display clear error messages for expired or already-used magic links.
- **FR-016**: System MUST allow authenticated users to log out and terminate their session.
- **FR-017**: System MUST use secure, HttpOnly cookies for session management.

### Key Entities

- **AccessRequest**: Represents a user's request to gain access to protected endpoints. Contains the user's email, request status (pending, approved, rejected), timestamps for creation and status changes, and admin action tokens.

- **MagicLink**: Represents a single-use authentication token sent to approved users. Contains the token value, associated email, expiration timestamp, and usage status.

- **Session**: Represents an authenticated user's active session. Contains the session identifier, associated email, creation timestamp, and expiration timestamp.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All app pages load successfully for unauthenticated users (0% authentication barriers for navigation).
- **SC-002**: 100% of unauthenticated requests to protected API endpoints are blocked with clear error messages.
- **SC-003**: Users can complete the access request flow (submitting email) in under 1 minute.
- **SC-004**: Administrators can approve or reject an access request within 30 seconds of receiving the notification email.
- **SC-005**: Magic links are invalidated after first use with 100% reliability.
- **SC-006**: Sessions correctly expire after 7 days, requiring re-authentication for protected endpoints.
- **SC-007**: Magic links expire after 24 hours with no exceptions.
- **SC-008**: Users see clear, actionable error messages when authentication fails (no silent failures).
- **SC-009**: The system functions correctly in both local development and production environments.

## Assumptions

- The application is primarily a public-facing app where pages and UI are accessible to everyone.
- Only specific API endpoints that consume LLM tokens need protection (currently /api/chat).
- The administrator's email address will be provided via the ADMIN_EMAIL environment variable.
- Email delivery is handled by a third-party service (implementation detail to be determined in planning).
- Additional endpoints can be added to the protection list as needed without code changes.
- Session tokens will be stored in HttpOnly, Secure (in production), SameSite cookies.
- The main chat page (/) will be the destination after successful authentication.
- Rejected users can re-apply for access (rejections are not permanent bans).
- The chat UI will gracefully handle unauthenticated users by showing an access request prompt instead of attempting API calls.
