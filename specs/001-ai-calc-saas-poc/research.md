# Research: AI Calculation SaaS PoC

**Branch**: `001-ai-calc-saas-poc` | **Date**: 2025-01-28
**Purpose**: Document technical decisions and research findings for implementation

## Technology Decisions

### 1. MCP Tool Integration with Vercel AI SDK

**Decision**: Use Vercel AI SDK's `tools` parameter to define MCP-compatible calculation tools directly, rather than running a separate MCP server process.

**Rationale**:
- Vercel AI SDK natively supports tool definitions that align with MCP's tool schema
- Avoids complexity of inter-process communication for a PoC
- Tools are defined in `/lib/mcp-server.ts` and imported into the API route
- Maintains the MCP principle of isolated, pure calculation tools

**Alternatives Considered**:
- Full MCP server via stdio transport: Rejected - overkill for PoC, adds deployment complexity
- HTTP-based MCP server: Rejected - unnecessary network hop for same-process tools

### 2. Audio Input Handling

**Decision**: Use browser MediaRecorder API to capture audio, convert to base64, and send as attachment via Vercel AI SDK's `experimental_attachments`.

**Rationale**:
- MediaRecorder API is widely supported in modern browsers
- Gemini 1.5 models natively support audio input
- No server-side transcription needed - Gemini handles audio-to-text

**Alternatives Considered**:
- Web Speech API for browser-side transcription: Rejected - inconsistent browser support, less accurate than Gemini
- Whisper API for transcription: Rejected - adds external dependency and latency

### 3. Document Input Handling

**Decision**: Convert uploaded images/PDFs to base64 and send via `experimental_attachments`. Gemini will extract text/numbers directly from the visual content.

**Rationale**:
- Gemini 1.5 models are multimodal and can read documents natively
- No OCR preprocessing required
- Simplifies the pipeline significantly

**Alternatives Considered**:
- Tesseract.js for client-side OCR: Rejected - adds bundle size, Gemini does this natively
- pdf.js + canvas extraction: Rejected - complex, Gemini handles PDFs directly

### 4. State Management

**Decision**: Use `useChat` hook from `@ai-sdk/react` for conversation state. No persistent storage.

**Rationale**:
- `useChat` provides streaming, message history, and error handling out of the box
- PoC doesn't require persistence across sessions
- Simplifies architecture significantly

**Alternatives Considered**:
- zustand/jotai: Rejected - overkill for single chat interface
- localStorage persistence: Rejected - not required for PoC scope

### 5. Error Handling Strategy

**Decision**: Toast notifications via Shadcn UI's Toast component for user-facing errors. Try/Catch blocks in API route with structured error responses.

**Rationale**:
- Aligns with Constitution Principle V (Graceful Error Handling)
- Shadcn Toast provides consistent, accessible notifications
- Structured errors enable frontend to display meaningful messages

**Implementation Pattern**:
```typescript
// API route
try {
  // ... processing
} catch (error) {
  return new Response(JSON.stringify({
    error: error instanceof Error ? error.message : 'Unknown error'
  }), { status: 500 });
}

// Frontend (via useChat onError)
toast({
  variant: "destructive",
  title: "Calculation Error",
  description: error.message,
});
```

### 6. Calculation Tool Schema

**Decision**: Define four tools (add, subtract, multiply, divide) using Zod schemas for parameter validation.

**Rationale**:
- Zod provides runtime type validation and generates TypeScript types
- Vercel AI SDK integrates directly with Zod schemas
- Ensures type safety per Constitution Principle III

**Tool Schema Pattern**:
```typescript
const addTool = tool({
  description: 'Add two numbers together',
  parameters: z.object({
    a: z.number().describe('First number'),
    b: z.number().describe('Second number'),
  }),
  execute: async ({ a, b }) => ({ result: a + b, operation: 'add', operands: [a, b] }),
});
```

## Browser Compatibility

| Feature | Chrome | Firefox | Edge | Safari |
|---------|--------|---------|------|--------|
| MediaRecorder | ✅ | ✅ | ✅ | ✅ 14.1+ |
| File API | ✅ | ✅ | ✅ | ✅ |
| Fetch Streaming | ✅ | ✅ | ✅ | ✅ |
| ES2020+ | ✅ | ✅ | ✅ | ✅ |

## Environment Variables Required

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI Studio API key for Gemini | Yes |

## Dependencies Summary

| Package | Purpose | Version |
|---------|---------|---------|
| `next` | Framework | 14.x |
| `ai` | Vercel AI SDK core | ^3.x |
| `@ai-sdk/google` | Google Gemini provider | ^0.x |
| `@ai-sdk/react` | React hooks (useChat) | ^0.x |
| `zod` | Schema validation | ^3.x |
| `lucide-react` | Icons | ^0.x |
| `tailwindcss` | Styling | ^3.x |
| Shadcn UI | UI components | (via CLI) |

## Open Questions Resolved

All technical questions resolved - no NEEDS CLARIFICATION items remain.
