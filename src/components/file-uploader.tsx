"use client";

/**
 * FileUploader Component
 * Drag-and-drop and click-to-upload component for images and PDFs
 * Converts files to base64 data URLs for AI processing
 */

import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileUp, X, FileImage, FileText } from "lucide-react";

const ACCEPTED_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "application/pdf": [".pdf"],
};

const ACCEPTED_MIME_TYPES = Object.keys(ACCEPTED_TYPES);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface FileUploadResult {
  dataUrl: string;
  mediaType: string;
  filename: string;
}

export interface FileUploaderProps {
  onFileSelect: (file: FileUploadResult) => void;
  disabled?: boolean;
}

export function FileUploader({ onFileSelect, disabled = false }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<FileUploadResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Convert a file to base64 data URL
   */
  const fileToDataUrl = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to convert file to data URL"));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }, []);

  /**
   * Validate file type and size
   */
  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
      return `Unsupported file format. Please upload JPEG, PNG, or PDF files.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is 10MB.`;
    }
    return null;
  }, []);

  /**
   * Process the selected file
   */
  const processFile = useCallback(
    async (file: File) => {
      const error = validateFile(file);
      if (error) {
        toast.error("Invalid File", { description: error });
        return;
      }

      setIsProcessing(true);
      try {
        const dataUrl = await fileToDataUrl(file);
        const result: FileUploadResult = {
          dataUrl,
          mediaType: file.type,
          filename: file.name,
        };
        setPreview(result);
      } catch (err) {
        console.error("File processing error:", err);
        toast.error("File Error", {
          description: "Failed to process the file. Please try again.",
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [fileToDataUrl, validateFile]
  );

  /**
   * Handle drag events
   */
  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled || isProcessing) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        processFile(files[0]);
      }
    },
    [disabled, isProcessing, processFile]
  );

  /**
   * Handle file input change
   */
  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
      // Reset input to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [processFile]
  );

  /**
   * Open file dialog
   */
  const handleClick = useCallback(() => {
    if (!disabled && !isProcessing) {
      fileInputRef.current?.click();
    }
  }, [disabled, isProcessing]);

  /**
   * Clear the preview
   */
  const handleClear = useCallback(() => {
    setPreview(null);
  }, []);

  /**
   * Send the file
   */
  const handleSend = useCallback(() => {
    if (preview) {
      onFileSelect(preview);
      setPreview(null);
    }
  }, [preview, onFileSelect]);

  /**
   * Get file icon based on type
   */
  const getFileIcon = (mediaType: string) => {
    if (mediaType === "application/pdf") {
      return <FileText className="h-8 w-8" />;
    }
    return <FileImage className="h-8 w-8" />;
  };

  // Show preview if file is selected
  if (preview) {
    return (
      <Card className="p-4">
        <div className="flex items-start gap-4">
          {/* Preview thumbnail */}
          <div className="flex-shrink-0">
            {preview.mediaType.startsWith("image/") ? (
              <img
                src={preview.dataUrl}
                alt="Preview"
                className="h-20 w-20 object-cover rounded-md"
              />
            ) : (
              <div className="h-20 w-20 bg-muted rounded-md flex items-center justify-center">
                {getFileIcon(preview.mediaType)}
              </div>
            )}
          </div>

          {/* File info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{preview.filename}</p>
            <p className="text-xs text-muted-foreground">
              {preview.mediaType === "application/pdf" ? "PDF Document" : "Image"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleClear}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button onClick={handleSend} disabled={disabled}>
              Send
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Show drop zone
  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`
        border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
        transition-colors duration-200
        ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
        ${disabled || isProcessing ? "opacity-50 cursor-not-allowed" : "hover:border-primary/50"}
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_MIME_TYPES.join(",")}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isProcessing}
      />

      <FileUp className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />

      <p className="text-sm font-medium">
        {isProcessing ? "Processing..." : "Drop a file or click to upload"}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        JPEG, PNG, or PDF (max 10MB)
      </p>
    </div>
  );
}
