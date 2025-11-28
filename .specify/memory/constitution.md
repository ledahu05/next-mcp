<!--
  ============================================================================
  SYNC IMPACT REPORT
  ============================================================================
  Version Change: N/A (initial) → 1.0.0

  Modified Principles:
  - [NEW] I. Serverless-First Architecture
  - [NEW] II. MCP Protocol Compliance
  - [NEW] III. Type Safety (NON-NEGOTIABLE)
  - [NEW] IV. Component Standards
  - [NEW] V. Graceful Error Handling

  Added Sections:
  - Tech Stack
  - File Structure
  - Governance

  Removed Sections:
  - None (initial constitution)

  Templates Requiring Updates:
  - .specify/templates/plan-template.md ✅ aligned (no changes needed)
  - .specify/templates/spec-template.md ✅ aligned (no changes needed)
  - .specify/templates/tasks-template.md ✅ aligned (no changes needed)
  - .specify/templates/commands/*.md - No command files exist

  Follow-up TODOs:
  - None
  ============================================================================
-->

# WhatsApp-to-SaaS PoC Constitution

## Core Principles

### I. Serverless-First Architecture

All backend logic MUST use Next.js API Routes or Server Actions. Direct server
deployments are prohibited unless explicitly justified and documented in the
Complexity Tracking section of the implementation plan.

**Rationale**: Serverless architecture enables rapid iteration, automatic scaling,
and reduced operational overhead for this proof-of-concept.

### II. MCP Protocol Compliance

-   The backend MUST implement a local MCP server instance (or modular adapter)
    that defines "Calculation Tools".
-   The Main Agent MUST act as an MCP Client to consume these tools.
-   Calculation Tools MUST remain pure and isolated from LLM logic.

**Rationale**: Model Context Protocol provides a standardized interface for tool
invocation, enabling clean separation between AI orchestration and business logic.

### III. Type Safety (NON-NEGOTIABLE)

-   TypeScript strict mode MUST be enabled.
-   The `any` type is PROHIBITED. Interfaces MUST be defined for all props and
    data structures.
-   Violations block PR approval.

**Rationale**: Strong typing prevents runtime errors, improves IDE support, and
makes refactoring safer in a rapidly evolving proof-of-concept.

### IV. Component Standards

-   All React components MUST be functional components.
-   UI elements MUST use Shadcn UI components (Buttons, Inputs, Dialogs, Cards).
-   The Google Gemini model MUST be configured to handle multimodal input (Text,
    Audio, Images/PDFs) natively or via preprocessing.

**Rationale**: Consistent component patterns reduce cognitive load and enable
predictable UI behavior across the application.

### V. Graceful Error Handling

-   UI errors MUST display Toast notifications to users.
-   Backend errors MUST be wrapped in Try/Catch blocks with structured error
    responses.
-   Silent failures are prohibited.

**Rationale**: Explicit error handling improves debugging and user experience
during the proof-of-concept validation phase.

## Tech Stack

| Category         | Technology                                              |
| ---------------- | ------------------------------------------------------- |
| Framework        | Next.js 14+ (App Router)                                |
| Language         | TypeScript (Strict mode)                                |
| Styling          | Tailwind CSS                                            |
| UI Components    | Shadcn UI (Radix Primitives)                            |
| AI Integration   | Vercel AI SDK (`ai`, `@ai-sdk/google`, `@ai-sdk/react`) |
| Backend Protocol | Model Context Protocol                                  |
| Model Provider   | Google Gemini                                           |

## File Structure

```text
/app          # Pages and API routes
/components   # UI components
/lib          # Utility functions and MCP server definitions
/hooks        # Custom React hooks (specifically for Audio recording)
```

## Governance

This constitution supersedes all other development practices for this project.
Amendments require:

1. Documentation of the proposed change and rationale.
2. Review and approval by the project owner.
3. Migration plan for existing code if breaking changes introduced.

All pull requests MUST verify compliance with Core Principles. Complexity beyond
what is documented MUST be justified in the Complexity Tracking section of the
relevant implementation plan.

### Versioning Policy

Constitution versions follow semantic versioning:

-   **MAJOR**: Backward-incompatible principle removals or redefinitions.
-   **MINOR**: New principle or section added, or materially expanded guidance.
-   **PATCH**: Clarifications, wording improvements, non-semantic refinements.

### Compliance Review

Before merging any feature:

1. Verify Principle III (Type Safety) - no `any` types.
2. Verify Principle IV (Component Standards) - functional components and Shadcn UI.
3. Verify Principle V (Error Handling) - Toast notifications and Try/Catch blocks.

**Version**: 1.0.0 | **Ratified**: 2025-01-28 | **Last Amended**: 2025-01-28
