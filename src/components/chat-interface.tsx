"use client";

/**
 * ChatInterface Component
 * Main chat container with text input, message display, and tool invocation rendering
 * Supports text and voice input
 * Updated for AI SDK 5.x
 */

import { useChat } from "@ai-sdk/react";
import { useRef, useEffect, useState, useCallback, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Calculator, Loader2, Mic } from "lucide-react";
import { AudioRecorder } from "@/components/audio-recorder";
import type { CalculationResult } from "@/lib/types";

export function ChatInterface() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  const { messages, status, sendMessage, error } = useChat({
    onError: (err) => {
      toast.error("Calculation Error", {
        description: err.message || "An unexpected error occurred",
      });
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Show error toast when error changes
  useEffect(() => {
    if (error) {
      toast.error("Error", {
        description: error.message || "An unexpected error occurred",
      });
    }
  }, [error]);

  // Log messages for debugging
  useEffect(() => {
    console.log('[Chat] Messages updated:', JSON.stringify(messages, null, 2));
    console.log('[Chat] Status:', status);
  }, [messages, status]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        sendMessage({ text: input });
        setInput("");
      }
    }
  };

  // Handle audio recording completion
  const handleAudioRecording = useCallback((audioDataUrl: string) => {
    // Extract the media type from the data URL
    const mediaTypeMatch = audioDataUrl.match(/^data:([^;]+);/);
    const mediaType = mediaTypeMatch ? mediaTypeMatch[1] : 'audio/webm';

    // Send the audio as a file attachment with a prompt to transcribe and calculate
    sendMessage({
      text: "Please listen to this audio and perform the calculation I'm asking for.",
      files: [{
        type: 'file',
        mediaType,
        url: audioDataUrl,
        filename: 'voice-recording.webm',
      }],
    });
  }, [sendMessage]);

  // Get text content from message parts
  const getMessageText = (message: typeof messages[number]): string => {
    // AI SDK 5.x uses parts array for message content
    if (Array.isArray(message.parts)) {
      return message.parts
        .filter((part): part is { type: "text"; text: string } => part.type === "text")
        .map((part) => part.text)
        .join("");
    }
    return "";
  };

  // Tool part type definition for AI SDK 5.x
  type ToolPart = {
    type: "tool-call" | "tool-result" | "tool-error";
    toolCallId: string;
    toolName: string;
    input?: unknown;
    output?: unknown;
    error?: unknown;
  };

  // Get tool parts from message parts
  const getToolParts = (message: typeof messages[number]): ToolPart[] => {
    if (!Array.isArray(message.parts)) return [];
    return message.parts
      .filter(
        (part) =>
          part.type === "tool-call" || part.type === "tool-result" || part.type === "tool-error"
      )
      .map((part) => part as unknown as ToolPart);
  };

  // File part type for audio/document display
  type FilePart = {
    type: "file";
    mediaType: string;
    url: string;
    filename?: string;
  };

  // Get file parts from message parts
  const getFileParts = (message: typeof messages[number]): FilePart[] => {
    if (!Array.isArray(message.parts)) return [];
    return message.parts
      .filter((part) => part.type === "file")
      .map((part) => part as unknown as FilePart);
  };

  // Check if a file is audio
  const isAudioFile = (mediaType: string): boolean => {
    return mediaType.startsWith("audio/");
  };

  // Render tool result
  const renderToolResult = (toolPart: ToolPart, index: number) => {
    // Show loading state for tool calls without results
    if (toolPart.type === "tool-call") {
      return (
        <div key={`tool-${toolPart.toolCallId}-${index}`} className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Calculating...</span>
        </div>
      );
    }

    // Show error state
    if (toolPart.type === "tool-error") {
      return (
        <Card key={`tool-${toolPart.toolCallId}-${index}`} className="bg-destructive/10 border-destructive/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-destructive">
              <Calculator className="h-4 w-4" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-sm mt-1">{String(toolPart.error)}</p>
          </CardContent>
        </Card>
      );
    }

    // Show tool result
    const result = toolPart.output as CalculationResult | undefined;
    if (!result) return null;

    if (result.error) {
      return (
        <Card key={`tool-${toolPart.toolCallId}-${index}`} className="bg-destructive/10 border-destructive/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-destructive">
              <Calculator className="h-4 w-4" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-sm mt-1">{result.error}</p>
          </CardContent>
        </Card>
      );
    }

    const operationSymbol = {
      add: "+",
      subtract: "-",
      multiply: "×",
      divide: "÷",
    }[result.operation] || "?";

    return (
      <Card key={`tool-${toolPart.toolCallId}-${index}`} className="bg-primary/5 border-primary/20">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 text-primary">
            <Calculator className="h-4 w-4" />
            <span className="font-medium">Calculation</span>
          </div>
          <div className="text-sm mt-1 font-mono">
            {result.operands[0]} {operationSymbol} {result.operands[1]} ={" "}
            <span className="font-bold text-primary">{result.result}</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-2rem)] w-full max-w-3xl mx-auto">
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">AI Calculator</p>
              <p className="text-sm">
                Ask me to calculate something! Try &quot;What is 25 plus 17?&quot;
              </p>
            </div>
          )}

          {messages.map((message) => {
            const text = getMessageText(message);
            const toolParts = getToolParts(message);
            const fileParts = getFileParts(message);
            console.log('[Chat] Rendering message:', message.id, 'role:', message.role, 'text:', text, 'toolParts:', toolParts.length, 'fileParts:', fileParts.length);

            return (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {/* Audio attachments */}
                  {fileParts.filter(f => isAudioFile(f.mediaType)).length > 0 && (
                    <div className="mb-2 space-y-2">
                      {fileParts.filter(f => isAudioFile(f.mediaType)).map((_, index) => (
                        <div key={`audio-${index}`} className="flex items-center gap-2">
                          <Mic className="h-4 w-4" />
                          <span className="text-sm">Voice message</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Message content */}
                  {text && <p className="whitespace-pre-wrap">{text}</p>}

                  {/* Tool results */}
                  {toolParts.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {toolParts.map((tool, index) => renderToolResult(tool, index))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me to calculate something..."
            className="min-h-[60px] resize-none"
            disabled={isLoading}
          />
          <div className="flex flex-col gap-2">
            <AudioRecorder
              onRecordingComplete={handleAudioRecording}
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="h-[60px] w-[60px]"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </form>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send, Shift+Enter for new line, or use the microphone
        </p>
      </div>
    </div>
  );
}
