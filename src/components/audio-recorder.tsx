"use client";

/**
 * AudioRecorder Component
 * Provides a microphone button for recording voice input
 * Shows recording indicator and handles permission errors
 */

import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";

interface AudioRecorderProps {
  /** Called when recording is complete with the audio data URL */
  onRecordingComplete: (audioDataUrl: string) => void;
  /** Whether the recorder should be disabled */
  disabled?: boolean;
}

export function AudioRecorder({ onRecordingComplete, disabled }: AudioRecorderProps) {
  const {
    state,
    isRecording,
    audioDataUrl,
    error,
    startRecording,
    stopRecording,
    reset,
  } = useAudioRecorder();

  // Handle recording completion
  useEffect(() => {
    if (state === "stopped" && audioDataUrl) {
      onRecordingComplete(audioDataUrl);
      reset();
    }
  }, [state, audioDataUrl, onRecordingComplete, reset]);

  // Show error toast for permission denied
  useEffect(() => {
    if (error) {
      if (error.type === "permission_denied") {
        toast.error("Microphone Access Denied", {
          description: error.message,
        });
      } else if (error.type === "not_supported") {
        toast.error("Not Supported", {
          description: error.message,
        });
      } else {
        toast.error("Recording Error", {
          description: error.message,
        });
      }
      reset();
    }
  }, [error, reset]);

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Button
      type="button"
      variant={isRecording ? "destructive" : "outline"}
      size="icon"
      onClick={handleClick}
      disabled={disabled}
      className={`h-[60px] w-[60px] relative ${
        isRecording ? "animate-pulse" : ""
      }`}
      title={isRecording ? "Stop recording" : "Start voice recording"}
    >
      {state === "stopped" ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isRecording ? (
        <>
          <MicOff className="h-5 w-5" />
          {/* Recording indicator */}
          <span className="absolute top-1 right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          </span>
        </>
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </Button>
  );
}
