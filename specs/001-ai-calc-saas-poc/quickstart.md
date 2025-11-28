# Quickstart: AI Calculation SaaS PoC

**Branch**: `001-ai-calc-saas-poc` | **Date**: 2025-01-28
**Purpose**: Step-by-step guide to run and validate the feature

## Prerequisites

- Node.js 18.x or higher
- npm or pnpm
- Google AI Studio API key ([Get one here](https://aistudio.google.com/app/apikey))
- Modern browser (Chrome, Firefox, Edge, Safari 14.1+)

## Setup

### 1. Clone and Install

```bash
git checkout 001-ai-calc-saas-poc
npm install
```

### 2. Initialize Shadcn UI (if not done)

```bash
npx shadcn-ui@latest init
```

Select these options:
- Style: Default
- Base color: Slate
- CSS variables: Yes

### 3. Install Shadcn Components

```bash
npx shadcn-ui@latest add button input card scroll-area textarea toast
```

### 4. Configure Environment

Create `.env.local` in the project root:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Validation Checklist

### User Story 1: Text-Based Math Query (P1)

- [ ] Navigate to http://localhost:3000
- [ ] Type "What is 25 plus 17?" in the text input
- [ ] Click Send or press Enter
- [ ] **Expected**: Response shows "42" with addition operation details
- [ ] Type "Divide 100 by 4"
- [ ] **Expected**: Response shows "25" with division operation details
- [ ] Type "Hello"
- [ ] **Expected**: Conversational response without calculation tool invocation

### User Story 2: Voice-Based Math Query (P2)

- [ ] Grant microphone permission when prompted
- [ ] Click and hold the microphone button
- [ ] Speak "Multiply seven by eight"
- [ ] Release the button
- [ ] **Expected**: Audio is transcribed and response shows "56"
- [ ] Test with background noise
- [ ] **Expected**: System asks for clarification if transcription is unclear

### User Story 3: Document-Based Math Extraction (P3)

- [ ] Click the upload button
- [ ] Upload an image of a receipt with visible prices
- [ ] Type "Calculate the total"
- [ ] **Expected**: System extracts numbers and displays the sum
- [ ] Upload a blurry/unreadable image
- [ ] **Expected**: Error message asking to upload a clearer image

### Edge Cases

- [ ] Type "Divide 10 by 0"
- [ ] **Expected**: Friendly error message about division by zero
- [ ] Deny microphone permission, then click record
- [ ] **Expected**: Error toast guiding user to grant permissions
- [ ] Upload an unsupported file format (e.g., .txt)
- [ ] **Expected**: Error message listing accepted formats

## Success Criteria Validation

| Criteria | Test | Target |
|----------|------|--------|
| SC-001 | Time from submit to result (text) | < 5 seconds |
| SC-002 | Time from submit to result (audio) | < 8 seconds |
| SC-003 | Time from submit to result (document) | < 10 seconds |
| SC-004 | Accuracy of clear math queries | 95%+ |
| SC-005 | Error messages for failure scenarios | 100% |
| SC-006 | No page refresh required | Yes |
| SC-007 | Consistent tool results | Yes |

## Troubleshooting

### "API key not found" error
- Ensure `.env.local` exists with `GOOGLE_GENERATIVE_AI_API_KEY`
- Restart the dev server after adding env vars

### Microphone not working
- Check browser permissions (click lock icon in address bar)
- Ensure HTTPS or localhost (MediaRecorder requires secure context)

### Slow responses
- Check network connectivity
- Gemini API may have rate limits - wait and retry

### Tools not being called
- Verify MCP tools are imported in `/app/api/chat/route.ts`
- Check server console for errors
- Ensure prompt guides agent to use calculation tools

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```
