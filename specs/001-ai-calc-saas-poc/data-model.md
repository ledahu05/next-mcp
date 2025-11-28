# Data Model: AI Calculation SaaS PoC

**Branch**: `001-ai-calc-saas-poc` | **Date**: 2025-01-28
**Purpose**: Define TypeScript interfaces and data structures for the application

## Core Entities

### Message

Represents a single exchange in the conversation between user and AI agent.

```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
  attachments?: Attachment[];
  toolInvocations?: ToolInvocation[];
}
```

**Notes**:
- Uses Vercel AI SDK's message format for compatibility with `useChat`
- `attachments` holds audio/document data when present
- `toolInvocations` contains calculation tool calls and results

### Attachment

Represents a file or audio blob attached to a message.

```typescript
interface Attachment {
  name: string;
  contentType: string; // e.g., 'audio/webm', 'image/png', 'application/pdf'
  url: string; // Data URL (base64) or blob URL
}
```

**Supported Content Types**:
- Audio: `audio/webm`, `audio/mp4`, `audio/mpeg`
- Images: `image/png`, `image/jpeg`, `image/webp`
- Documents: `application/pdf`

### ToolInvocation

Represents a calculation tool call by the AI agent.

```typescript
interface ToolInvocation {
  toolCallId: string;
  toolName: 'add' | 'subtract' | 'multiply' | 'divide';
  args: CalculationArgs;
  result?: CalculationResult;
  state: 'pending' | 'result';
}
```

### CalculationArgs

Input parameters for calculation tools.

```typescript
interface CalculationArgs {
  a: number;
  b: number;
}
```

**Validation Rules**:
- Both `a` and `b` must be finite numbers
- For division, `b` must not be zero

### CalculationResult

Output from calculation tools.

```typescript
interface CalculationResult {
  result: number;
  operation: 'add' | 'subtract' | 'multiply' | 'divide';
  operands: [number, number];
  error?: string; // Present if calculation failed (e.g., division by zero)
}
```

## Tool Definitions (MCP-Compatible)

### Add Tool

```typescript
const addTool = {
  name: 'add',
  description: 'Add two numbers together and return the sum',
  parameters: {
    type: 'object',
    properties: {
      a: { type: 'number', description: 'First number to add' },
      b: { type: 'number', description: 'Second number to add' },
    },
    required: ['a', 'b'],
  },
};
```

### Subtract Tool

```typescript
const subtractTool = {
  name: 'subtract',
  description: 'Subtract the second number from the first number',
  parameters: {
    type: 'object',
    properties: {
      a: { type: 'number', description: 'Number to subtract from' },
      b: { type: 'number', description: 'Number to subtract' },
    },
    required: ['a', 'b'],
  },
};
```

### Multiply Tool

```typescript
const multiplyTool = {
  name: 'multiply',
  description: 'Multiply two numbers together and return the product',
  parameters: {
    type: 'object',
    properties: {
      a: { type: 'number', description: 'First number to multiply' },
      b: { type: 'number', description: 'Second number to multiply' },
    },
    required: ['a', 'b'],
  },
};
```

### Divide Tool

```typescript
const divideTool = {
  name: 'divide',
  description: 'Divide the first number by the second number',
  parameters: {
    type: 'object',
    properties: {
      a: { type: 'number', description: 'Dividend (number to be divided)' },
      b: { type: 'number', description: 'Divisor (number to divide by, must not be zero)' },
    },
    required: ['a', 'b'],
  },
};
```

## API Types

### Chat Request

```typescript
interface ChatRequest {
  messages: Message[];
}
```

**Notes**:
- Vercel AI SDK handles request parsing via `useChat`
- Attachments are included in message objects

### Chat Response

Streaming response - uses Vercel AI SDK's stream format.

```typescript
// Response is a ReadableStream with the following event types:
// - text-delta: Incremental text from assistant
// - tool-call: Tool invocation request
// - tool-result: Tool execution result
// - finish: Stream completion
```

### Error Response

```typescript
interface ErrorResponse {
  error: string;
  code?: 'DIVISION_BY_ZERO' | 'INVALID_INPUT' | 'PROCESSING_ERROR' | 'UNKNOWN';
}
```

## Component Props

### ChatInterfaceProps

```typescript
interface ChatInterfaceProps {
  // No props - uses useChat hook internally
}
```

### AudioRecorderProps

```typescript
interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  disabled?: boolean;
}
```

### FileUploaderProps

```typescript
interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  acceptedTypes?: string; // Default: 'image/*,.pdf'
  disabled?: boolean;
}
```

## State Interfaces

### AudioRecorderState

```typescript
interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number; // seconds
  error: string | null;
}
```

## Validation Rules Summary

| Field | Rule |
|-------|------|
| `CalculationArgs.a` | Must be a finite number |
| `CalculationArgs.b` | Must be a finite number; for divide, must not be zero |
| `Attachment.contentType` | Must be one of the supported types |
| `Message.content` | Required, non-empty string |
