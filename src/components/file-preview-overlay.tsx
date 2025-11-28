"use client";

/**
 * FilePreviewOverlay Component
 * WhatsApp-style full-screen overlay for previewing files before sending
 */

import { useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, FileText } from "lucide-react";

export interface FilePreviewData {
  dataUrl: string;
  mediaType: string;
  filename: string;
}

export interface FilePreviewOverlayProps {
  file: FilePreviewData;
  onSend: (caption: string) => void;
  onClose: () => void;
  disabled?: boolean;
}

export function FilePreviewOverlay({
  file,
  onSend,
  onClose,
  disabled = false,
}: FilePreviewOverlayProps) {
  const [caption, setCaption] = useState("");

  const isImage = file.mediaType.startsWith("image/");
  const isPdf = file.mediaType === "application/pdf";

  const handleSend = () => {
    if (!disabled) {
      onSend(caption);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !disabled) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90">
      {/* Header with close button */}
      <div className="flex items-center justify-between p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/10"
        >
          <X className="h-6 w-6" />
        </Button>
        <span className="text-white/70 text-sm">{file.filename}</span>
        <div className="w-10" /> {/* Spacer for centering filename */}
      </div>

      {/* Preview area */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        {isImage ? (
          <img
            src={file.dataUrl}
            alt={file.filename}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        ) : isPdf ? (
          <div className="flex flex-col items-center gap-4 text-white">
            <FileText className="h-24 w-24 opacity-50" />
            <p className="text-lg">{file.filename}</p>
            <p className="text-sm text-white/50">PDF Document</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-white">
            <FileText className="h-24 w-24 opacity-50" />
            <p className="text-lg">{file.filename}</p>
          </div>
        )}
      </div>

      {/* Caption input and send button */}
      <div className="p-4 bg-black/50">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a caption... (optional)"
            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/30"
            disabled={disabled}
            autoFocus
          />
          <Button
            onClick={handleSend}
            disabled={disabled}
            size="icon"
            className="h-10 w-10 rounded-full bg-green-600 hover:bg-green-700"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
