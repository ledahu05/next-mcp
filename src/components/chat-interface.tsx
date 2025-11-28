'use client';

/**
 * ChatInterface Component
 * WhatsApp-style chat interface with text, voice, and document input
 * Updated for AI SDK 5.x
 */

import { useChat } from '@ai-sdk/react';
import {
    useRef,
    useEffect,
    useState,
    useCallback,
    type FormEvent
} from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Send,
    Calculator,
    Loader2,
    Mic,
    Paperclip,
    FileText
} from 'lucide-react';
import { AudioRecorder } from '@/components/audio-recorder';
import {
    FileUploader,
    type FileUploadResult
} from '@/components/file-uploader';
import { FilePreviewOverlay } from '@/components/file-preview-overlay';
import type { CalculationResult } from '@/lib/types';

export function ChatInterface() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [input, setInput] = useState('');
    const [showFileUploader, setShowFileUploader] = useState(false);
    const [pendingFile, setPendingFile] = useState<FileUploadResult | null>(
        null
    );

    const { messages, status, sendMessage, error } = useChat({
        onError: (err) => {
            toast.error('Calculation Error', {
                description: err.message || 'An unexpected error occurred'
            });
        }
    });

    const isLoading = status === 'streaming' || status === 'submitted';
    const hasInput = input.trim().length > 0;

    // Show error toast when error changes
    useEffect(() => {
        if (error) {
            toast.error('Error', {
                description: error.message || 'An unexpected error occurred'
            });
        }
    }, [error]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Handle form submission
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            sendMessage({ text: input });
            setInput('');
        }
    };

    // Handle keyboard shortcuts
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isLoading && input.trim()) {
            e.preventDefault();
            sendMessage({ text: input });
            setInput('');
        }
    };

    // Handle audio recording completion
    const handleAudioRecording = useCallback(
        (audioDataUrl: string) => {
            const mediaTypeMatch = audioDataUrl.match(/^data:([^;]+);/);
            const mediaType = mediaTypeMatch ? mediaTypeMatch[1] : 'audio/webm';

            sendMessage({
                text: "Please listen to this audio and perform the calculation I'm asking for.",
                files: [
                    {
                        type: 'file',
                        mediaType,
                        url: audioDataUrl,
                        filename: 'voice-recording.webm'
                    }
                ]
            });
        },
        [sendMessage]
    );

    // Handle file selection - show preview overlay
    const handleFileSelect = useCallback((file: FileUploadResult) => {
        setShowFileUploader(false);
        setPendingFile(file);
    }, []);

    // Handle sending file from preview overlay
    const handleFilePreviewSend = useCallback(
        (caption: string) => {
            if (!pendingFile) return;

            sendMessage({
                text:
                    caption.trim() ||
                    'Please analyze this document, extract any numbers, and help me with calculations based on what you find.',
                files: [
                    {
                        type: 'file',
                        mediaType: pendingFile.mediaType,
                        url: pendingFile.dataUrl,
                        filename: pendingFile.filename
                    }
                ]
            });
            setPendingFile(null);
        },
        [sendMessage, pendingFile]
    );

    // Handle closing preview overlay
    const handleFilePreviewClose = useCallback(() => {
        setPendingFile(null);
    }, []);

    // Get text content from message parts
    const getMessageText = (message: (typeof messages)[number]): string => {
        if (Array.isArray(message.parts)) {
            return message.parts
                .filter(
                    (part): part is { type: 'text'; text: string } =>
                        part.type === 'text'
                )
                .map((part) => part.text)
                .join('');
        }
        return '';
    };

    // Tool part type definition
    type ToolPart = {
        type: 'tool-call' | 'tool-result' | 'tool-error';
        toolCallId: string;
        toolName: string;
        input?: unknown;
        output?: unknown;
        error?: unknown;
    };

    const getToolParts = (message: (typeof messages)[number]): ToolPart[] => {
        if (!Array.isArray(message.parts)) return [];
        return message.parts
            .filter(
                (part) =>
                    part.type === 'tool-call' ||
                    part.type === 'tool-result' ||
                    part.type === 'tool-error'
            )
            .map((part) => part as unknown as ToolPart);
    };

    // File part type
    type FilePart = {
        type: 'file';
        mediaType: string;
        url: string;
        filename?: string;
    };

    const getFileParts = (message: (typeof messages)[number]): FilePart[] => {
        if (!Array.isArray(message.parts)) return [];
        return message.parts
            .filter((part) => part.type === 'file')
            .map((part) => part as unknown as FilePart);
    };

    const isAudioFile = (mediaType: string): boolean =>
        mediaType.startsWith('audio/');
    const isImageFile = (mediaType: string): boolean =>
        mediaType.startsWith('image/');
    const isPdfFile = (mediaType: string): boolean =>
        mediaType === 'application/pdf';

    // Render tool result
    const renderToolResult = (toolPart: ToolPart, index: number) => {
        if (toolPart.type === 'tool-call') {
            return (
                <div
                    key={`tool-${toolPart.toolCallId}-${index}`}
                    className='flex items-center gap-2 text-[var(--wa-text-secondary)]'
                >
                    <Loader2 className='h-4 w-4 animate-spin' />
                    <span className='text-sm'>Calculating...</span>
                </div>
            );
        }

        if (toolPart.type === 'tool-error') {
            return (
                <Card
                    key={`tool-${toolPart.toolCallId}-${index}`}
                    className='bg-red-50 border-red-200'
                >
                    <CardContent className='p-2'>
                        <div className='flex items-center gap-2 text-red-600'>
                            <Calculator className='h-4 w-4' />
                            <span className='font-medium text-sm'>Error</span>
                        </div>
                        <p className='text-xs mt-1 text-red-600'>
                            {String(toolPart.error)}
                        </p>
                    </CardContent>
                </Card>
            );
        }

        const result = toolPart.output as CalculationResult | undefined;
        if (!result) return null;

        if (result.error) {
            return (
                <Card
                    key={`tool-${toolPart.toolCallId}-${index}`}
                    className='bg-red-50 border-red-200'
                >
                    <CardContent className='p-2'>
                        <p className='text-xs text-red-600'>{result.error}</p>
                    </CardContent>
                </Card>
            );
        }

        const operationSymbol =
            {
                add: '+',
                subtract: '-',
                multiply: '×',
                divide: '÷'
            }[result.operation] || '?';

        return (
            <Card
                key={`tool-${toolPart.toolCallId}-${index}`}
                className='bg-[var(--wa-header)]/10 border-[var(--wa-header)]/20'
            >
                <CardContent className='p-2'>
                    <div className='flex items-center gap-2 text-[var(--wa-header)]'>
                        <Calculator className='h-4 w-4' />
                        <span className='font-medium text-sm'>Result</span>
                    </div>
                    <div className='text-sm mt-1 font-mono text-[var(--wa-text-primary)]'>
                        {result.operands[0]} {operationSymbol}{' '}
                        {result.operands[1]} ={' '}
                        <span className='font-bold text-[var(--wa-header)]'>
                            {result.result}
                        </span>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <>
            {/* WhatsApp-style file preview overlay */}
            {pendingFile && (
                <FilePreviewOverlay
                    file={pendingFile}
                    onSend={handleFilePreviewSend}
                    onClose={handleFilePreviewClose}
                    disabled={isLoading}
                />
            )}

            <div className='flex flex-col h-full w-full max-w-3xl mx-auto overflow-hidden'>
                {/* WhatsApp Header */}
                <header className='bg-[var(--wa-header)] text-white px-4 py-3 flex items-center gap-3 shadow-md'>
                    <div className='w-10 h-10 rounded-full bg-white/20 flex items-center justify-center'>
                        <Calculator className='h-6 w-6' />
                    </div>
                    <div className='flex-1'>
                        <h1 className='font-semibold'>AI Calculator</h1>
                        <p className='text-xs text-white/70'>Online</p>
                    </div>
                </header>

                {/* Chat Messages Area */}
                <div className='flex-1 overflow-y-auto wa-chat-bg p-4'>
                    <div className='space-y-2 max-w-3xl mx-auto'>
                        {messages.length === 0 && (
                            <div className='text-center py-8'>
                                <div className='inline-block bg-white/80 rounded-lg px-4 py-3 shadow-sm'>
                                    <p className='text-sm text-[var(--wa-text-secondary)]'>
                                        Type a message or send a voice/image to
                                        calculate
                                    </p>
                                </div>
                            </div>
                        )}

                        {messages.map((message) => {
                            const text = getMessageText(message);
                            const toolParts = getToolParts(message);
                            const fileParts = getFileParts(message);
                            const isUser = message.role === 'user';

                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${
                                        isUser ? 'justify-end' : 'justify-start'
                                    }`}
                                >
                                    <div
                                        className={`max-w-[85%] px-3 py-2 shadow-sm ${
                                            isUser
                                                ? 'wa-bubble-user mr-2'
                                                : 'wa-bubble-other ml-2'
                                        }`}
                                        style={{
                                            boxShadow:
                                                '0 1px 0.5px var(--wa-bubble-shadow)'
                                        }}
                                    >
                                        {/* Audio attachments */}
                                        {fileParts.filter((f) =>
                                            isAudioFile(f.mediaType)
                                        ).length > 0 && (
                                            <div className='mb-1'>
                                                {fileParts
                                                    .filter((f) =>
                                                        isAudioFile(f.mediaType)
                                                    )
                                                    .map((_, index) => (
                                                        <div
                                                            key={`audio-${index}`}
                                                            className='flex items-center gap-2 text-[var(--wa-text-secondary)]'
                                                        >
                                                            <Mic className='h-4 w-4' />
                                                            <span className='text-sm'>
                                                                Voice message
                                                            </span>
                                                        </div>
                                                    ))}
                                            </div>
                                        )}

                                        {/* Image attachments */}
                                        {fileParts
                                            .filter((f) =>
                                                isImageFile(f.mediaType)
                                            )
                                            .map((file, index) => (
                                                <div
                                                    key={`image-${index}`}
                                                    className='mb-1'
                                                >
                                                    <img
                                                        src={file.url}
                                                        alt={
                                                            file.filename ||
                                                            'Image'
                                                        }
                                                        className='max-w-full max-h-48 rounded object-contain'
                                                    />
                                                </div>
                                            ))}

                                        {/* PDF attachments */}
                                        {fileParts
                                            .filter((f) =>
                                                isPdfFile(f.mediaType)
                                            )
                                            .map((file, index) => (
                                                <div
                                                    key={`pdf-${index}`}
                                                    className='mb-1 flex items-center gap-2 text-[var(--wa-text-secondary)]'
                                                >
                                                    <FileText className='h-5 w-5' />
                                                    <span className='text-sm'>
                                                        {file.filename || 'PDF'}
                                                    </span>
                                                </div>
                                            ))}

                                        {/* Message text */}
                                        {text && (
                                            <p className='text-sm text-[var(--wa-text-primary)] whitespace-pre-wrap'>
                                                {text}
                                            </p>
                                        )}

                                        {/* Tool results */}
                                        {toolParts.length > 0 && (
                                            <div className='mt-2 space-y-1'>
                                                {toolParts.map((tool, index) =>
                                                    renderToolResult(
                                                        tool,
                                                        index
                                                    )
                                                )}
                                            </div>
                                        )}

                                        {/* Timestamp */}
                                        <div className='flex justify-end mt-1'>
                                            <span className='text-[10px] text-[var(--wa-text-secondary)]'>
                                                {new Date().toLocaleTimeString(
                                                    [],
                                                    {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    }
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Loading indicator */}
                        {isLoading && (
                            <div className='flex justify-start'>
                                <div className='wa-bubble-other ml-2 px-3 py-2 shadow-sm'>
                                    <div className='flex items-center gap-2 text-[var(--wa-text-secondary)]'>
                                        <Loader2 className='h-4 w-4 animate-spin' />
                                        <span className='text-sm'>
                                            Typing...
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={scrollRef} />
                    </div>
                </div>

                {/* File Uploader Drop Zone */}
                {showFileUploader && (
                    <div className='bg-[var(--wa-input-bg)] px-4 py-3 border-t'>
                        <FileUploader
                            onFileSelect={handleFileSelect}
                            disabled={isLoading}
                        />
                    </div>
                )}

                {/* WhatsApp Input Area */}
                <div className='bg-[var(--wa-input-bg)] px-3 py-2 flex items-center gap-2'>
                    {/* Attachment Button */}
                    <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={() => setShowFileUploader(!showFileUploader)}
                        disabled={isLoading}
                        className={`h-10 w-10 rounded-full hover:bg-black/5 ${
                            showFileUploader
                                ? 'text-[var(--wa-header)]'
                                : 'text-[var(--wa-text-secondary)]'
                        }`}
                    >
                        <Paperclip className='h-6 w-6' />
                    </Button>

                    {/* Input Field */}
                    <form
                        onSubmit={handleSubmit}
                        className='flex-1 flex items-center gap-2'
                    >
                        <div className='flex-1 relative'>
                            <input
                                ref={inputRef}
                                type='text'
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder='Type a message'
                                disabled={isLoading}
                                className='w-full bg-white rounded-full px-4 py-2.5 text-sm text-[var(--wa-text-primary)] placeholder:text-[var(--wa-text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--wa-header)]/30'
                            />
                        </div>

                        {/* Mic or Send Button */}
                        {hasInput ? (
                            <Button
                                type='submit'
                                disabled={isLoading}
                                className='h-10 w-10 rounded-full bg-[var(--wa-send-btn)] hover:bg-[var(--wa-send-btn)]/90 text-white p-0'
                            >
                                {isLoading ? (
                                    <Loader2 className='h-5 w-5 animate-spin' />
                                ) : (
                                    <Send className='h-5 w-5' />
                                )}
                            </Button>
                        ) : (
                            <AudioRecorder
                                onRecordingComplete={handleAudioRecording}
                                disabled={isLoading}
                            />
                        )}
                    </form>
                </div>
            </div>
        </>
    );
}
