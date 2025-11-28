/**
 * TypeScript interfaces for AI Calculation SaaS PoC
 * Based on data-model.md specification
 */

// Operation types for calculation tools
export type OperationType = 'add' | 'subtract' | 'multiply' | 'divide';

// Error codes for structured error responses
export type ErrorCode = 'DIVISION_BY_ZERO' | 'INVALID_INPUT' | 'PROCESSING_ERROR' | 'UNKNOWN';

/**
 * Input parameters for calculation tools
 */
export interface CalculationArgs {
  a: number;
  b: number;
}

/**
 * Output from calculation tools
 */
export interface CalculationResult {
  result: number;
  operation: OperationType;
  operands: [number, number];
  error?: string;
}

/**
 * Represents a file or audio blob attached to a message
 */
export interface Attachment {
  name: string;
  contentType: string;
  url: string;
}

/**
 * Supported content types for attachments
 */
export const SUPPORTED_AUDIO_TYPES = ['audio/webm', 'audio/mp4', 'audio/mpeg'] as const;
export const SUPPORTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;
export const SUPPORTED_DOCUMENT_TYPES = ['application/pdf'] as const;

export const SUPPORTED_CONTENT_TYPES = [
  ...SUPPORTED_AUDIO_TYPES,
  ...SUPPORTED_IMAGE_TYPES,
  ...SUPPORTED_DOCUMENT_TYPES,
] as const;

export type SupportedContentType = typeof SUPPORTED_CONTENT_TYPES[number];

/**
 * Represents a calculation tool call by the AI agent
 */
export interface ToolInvocation {
  toolCallId: string;
  toolName: OperationType;
  args: CalculationArgs;
  result?: CalculationResult;
  state: 'pending' | 'result';
}

/**
 * Represents a single exchange in the conversation
 */
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
  attachments?: Attachment[];
  toolInvocations?: ToolInvocation[];
}

/**
 * Error response structure for API errors
 */
export interface ErrorResponse {
  error: string;
  code?: ErrorCode;
}

/**
 * Props for AudioRecorder component
 */
export interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  disabled?: boolean;
}

/**
 * Props for FileUploader component
 */
export interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  acceptedTypes?: string;
  disabled?: boolean;
}

/**
 * State for AudioRecorder hook
 */
export interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  error: string | null;
}
