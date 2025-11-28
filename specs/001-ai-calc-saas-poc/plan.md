# Implementation Plan: AI Calculation SaaS PoC

**Branch**: `001-ai-calc-saas-poc` | **Date**: 2025-01-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ai-calc-saas-poc/spec.md`

## Summary

Build a Proof of Concept SaaS application that uses a Google Gemini AI Agent to perform mathematical operations based on multimodal user inputs (text, voice, documents). The math logic is decoupled and served via an MCP (Model Context Protocol) server running on the backend, exposing add, subtract, multiply, and divide tools.

## Technical Context

**Language/Version**: TypeScript 5.x (Strict mode)
**Primary Dependencies**: Next.js 14+, Vercel AI SDK (`ai`, `@ai-sdk/google`, `@ai-sdk/react`), `@modelcontextprotocol/sdk`, Shadcn UI, Tailwind CSS, Zod, lucide-react
**Storage**: N/A (stateless PoC - conversation history in memory/client state only)
**Testing**: Vitest for unit tests, Playwright for E2E (optional for PoC)
**Target Platform**: Web browser (Chrome, Firefox, Edge, Safari 14.1+)
**Project Type**: Web application (Next.js App Router - single project structure)
**Performance Goals**: Text queries < 5s, Audio queries < 8s, Document queries < 10s (per spec SC-001/002/003)
**Constraints**: Browser MediaRecorder API required, Modern browser only, Internet required for Gemini API
**Scale/Scope**: PoC - single user, no persistence, no authentication

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Status |
|-----------|-------------|--------|
| I. Serverless-First | All backend logic via Next.js API Routes/Server Actions | ✅ PASS - Using `/app/api/chat/route.ts` |
| II. MCP Protocol Compliance | Backend implements MCP server, Agent is MCP Client, Tools isolated | ✅ PASS - `/lib/mcp-server.ts` defines tools, agent consumes via Vercel AI SDK |
| III. Type Safety | TypeScript strict mode, no `any` types, interfaces for all data | ✅ PASS - Will use Zod schemas and TypeScript interfaces |
| IV. Component Standards | Functional components, Shadcn UI, Gemini multimodal | ✅ PASS - All components functional, Shadcn for UI, Gemini handles multimodal |
| V. Graceful Error Handling | Toast notifications for UI, Try/Catch for backend | ✅ PASS - Toast for errors, Try/Catch in API routes |

**Gate Status**: ✅ PASSED - No violations

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-calc-saas-poc/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
app/
├── page.tsx             # Main chat page
├── layout.tsx           # Root layout
├── globals.css          # Global styles (Tailwind)
└── api/
    └── chat/
        └── route.ts     # Chat API endpoint (POST)

components/
├── chat-interface.tsx   # Main chat container with useChat
├── audio-recorder.tsx   # MediaRecorder component
├── file-uploader.tsx    # Document upload component
└── ui/                  # Shadcn UI components
    ├── button.tsx
    ├── input.tsx
    ├── card.tsx
    ├── scroll-area.tsx
    ├── textarea.tsx
    └── toast.tsx

lib/
├── mcp-server.ts        # MCP tool definitions (add, subtract, multiply, divide)
└── utils.ts             # Utility functions (cn helper)

hooks/
└── use-audio-recorder.ts # Custom hook for audio recording logic
```

**Structure Decision**: Next.js App Router single project structure per constitution file structure requirements. All backend logic in `/app/api/`, components in `/components/`, utilities in `/lib/`, custom hooks in `/hooks/`.

## Complexity Tracking

> No violations - all requirements align with constitution principles.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
