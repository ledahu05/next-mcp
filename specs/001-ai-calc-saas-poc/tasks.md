# Tasks: AI Calculation SaaS PoC

**Input**: Design documents from `/specs/001-ai-calc-saas-poc/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - not explicitly requested in this feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js App Router**: `app/`, `components/`, `lib/`, `hooks/` at repository root
- Paths follow constitution file structure requirements

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize Next.js 14+ app with TypeScript and App Router in project root
- [x] T002 Configure TypeScript strict mode in tsconfig.json
- [x] T003 [P] Install and configure Tailwind CSS in tailwind.config.ts and app/globals.css
- [x] T004 [P] Initialize Shadcn UI with `npx shadcn-ui@latest init`
- [x] T005 Install Shadcn components: button, input, card, scroll-area, textarea, sonner
- [x] T006 [P] Install AI dependencies: `ai`, `@ai-sdk/google`, `@ai-sdk/react`, `zod`
- [x] T007 [P] Install utility dependencies: `lucide-react`
- [x] T008 Create environment variable file .env.local with GOOGLE_GENERATIVE_AI_API_KEY placeholder
- [x] T009 Create lib/utils.ts with cn() helper function for class merging

**Checkpoint**: Project structure ready - foundational phase can begin

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T010 Create TypeScript types in lib/types.ts per data-model.md (Message, Attachment, ToolInvocation, CalculationArgs, CalculationResult, ErrorResponse)
- [x] T011 Create MCP calculation tools (add, subtract, multiply, divide) with Zod schemas in lib/mcp-server.ts
- [x] T012 Implement division by zero handling in divide tool in lib/mcp-server.ts
- [x] T013 Create app/layout.tsx with Toaster provider from Shadcn UI
- [x] T014 Create API route POST handler scaffold in app/api/chat/route.ts
- [x] T015 Configure Google Gemini model with `createGoogleGenerativeAI` in app/api/chat/route.ts
- [x] T016 Connect MCP tools to streamText via tools parameter in app/api/chat/route.ts
- [x] T017 Add system prompt instructing agent to use calculation tools for math queries in app/api/chat/route.ts
- [x] T018 Implement try/catch error handling with structured ErrorResponse in app/api/chat/route.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Text-Based Math Query (Priority: P1)

**Goal**: User types a natural language math question, AI agent interprets and performs calculation using MCP tools, displays result with calculation steps

**Independent Test**: Type "Calculate 50 times 3" and verify response shows "150" with calculation details

### Implementation for User Story 1

- [x] T019 [US1] Create chat-interface.tsx component scaffold with useChat hook in components/chat-interface.tsx
- [x] T020 [US1] Implement message list display with scroll-area in components/chat-interface.tsx
- [x] T021 [US1] Implement text input form with textarea and send button in components/chat-interface.tsx
- [x] T022 [US1] Display tool invocations and calculation results in message rendering in components/chat-interface.tsx
- [x] T023 [US1] Implement error handling with toast notifications via useChat onError in components/chat-interface.tsx
- [x] T024 [US1] Create main page with ChatInterface component in app/page.tsx
- [x] T025 [US1] Style chat interface with Tailwind CSS for clean layout in components/chat-interface.tsx
- [x] T026 [US1] Add loading state indicator during AI response streaming in components/chat-interface.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Voice-Based Math Query (Priority: P2)

**Goal**: User clicks microphone, speaks math problem, system transcribes via Gemini, performs calculation, displays result

**Independent Test**: Record "Subtract twenty from fifty" and verify response shows "30" with calculation details

### Implementation for User Story 2

- [ ] T027 [US2] Create use-audio-recorder.ts custom hook with MediaRecorder API in hooks/use-audio-recorder.ts
- [ ] T028 [US2] Implement startRecording, stopRecording, and state management in hooks/use-audio-recorder.ts
- [ ] T029 [US2] Handle microphone permission requests and errors in hooks/use-audio-recorder.ts
- [ ] T030 [US2] Create audio-recorder.tsx component with microphone button in components/audio-recorder.tsx
- [ ] T031 [US2] Implement recording indicator (visual feedback) during recording in components/audio-recorder.tsx
- [ ] T032 [US2] Convert audio blob to base64 data URL on recording complete in components/audio-recorder.tsx
- [ ] T033 [US2] Integrate AudioRecorder into ChatInterface in components/chat-interface.tsx
- [ ] T034 [US2] Send audio as experimental_attachments via useChat append in components/chat-interface.tsx
- [ ] T035 [US2] Update system prompt to handle audio transcription in app/api/chat/route.ts
- [ ] T036 [US2] Add toast notification for microphone permission denial in components/audio-recorder.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Document-Based Math Extraction (Priority: P3)

**Goal**: User uploads image/PDF, AI extracts numbers, performs calculation based on user query, displays result

**Independent Test**: Upload image of invoice with line items and ask "What is the total?" - verify correct sum

### Implementation for User Story 3

- [ ] T037 [US3] Create file-uploader.tsx component with drag-and-drop area in components/file-uploader.tsx
- [ ] T038 [US3] Implement file input for click-to-upload in components/file-uploader.tsx
- [ ] T039 [US3] Validate accepted file types (JPEG, PNG, PDF) in components/file-uploader.tsx
- [ ] T040 [US3] Convert selected file to base64 data URL in components/file-uploader.tsx
- [ ] T041 [US3] Display file preview thumbnail after selection in components/file-uploader.tsx
- [ ] T042 [US3] Integrate FileUploader into ChatInterface in components/chat-interface.tsx
- [ ] T043 [US3] Send document as experimental_attachments via useChat in components/chat-interface.tsx
- [ ] T044 [US3] Update system prompt to extract numbers from documents in app/api/chat/route.ts
- [ ] T045 [US3] Add toast notification for unsupported file formats in components/file-uploader.tsx
- [ ] T046 [US3] Handle unreadable document errors with user-friendly message in components/file-uploader.tsx

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T047 [P] Add responsive design for mobile viewports in components/chat-interface.tsx
- [ ] T048 [P] Add keyboard shortcuts (Enter to send, Escape to cancel) in components/chat-interface.tsx
- [ ] T049 Validate all edge cases: division by zero, large numbers, ambiguous queries
- [ ] T050 Run quickstart.md validation checklist
- [ ] T051 [P] Code cleanup: ensure no `any` types per Constitution Principle III
- [ ] T052 [P] Verify all error scenarios display toast notifications per Constitution Principle V

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Integrates with ChatInterface from US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Integrates with ChatInterface from US1

### Within Each User Story

- Models/Types before services
- Services/Tools before endpoints
- Backend before frontend components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003, T004, T006, T007)
- Foundational types and components can be developed in parallel
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Within US2: Hook development (T027-T029) parallel to component development (T030-T031)
- Within US3: File handling (T037-T041) parallel to integration prep
- Polish tasks marked [P] can run in parallel (T047, T048, T051, T052)

---

## Parallel Example: Setup Phase

```bash
# Launch parallel Setup tasks:
Task T003: "Configure Tailwind CSS in tailwind.config.ts"
Task T004: "Initialize Shadcn UI"
Task T006: "Install AI dependencies"
Task T007: "Install utility dependencies"
```

## Parallel Example: User Story 2

```bash
# Launch hook and component development in parallel:
Task T027: "Create use-audio-recorder.ts custom hook"
Task T030: "Create audio-recorder.tsx component scaffold"

# After both complete, integration task:
Task T033: "Integrate AudioRecorder into ChatInterface"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (must complete first for ChatInterface base)
   - Developer B: User Story 2 (can start hook while A finishes)
   - Developer C: User Story 3 (can start file handling while A finishes)
3. Stories integrate into ChatInterface independently

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All tasks follow constitution principles: TypeScript strict, functional components, Shadcn UI, Toast for errors
