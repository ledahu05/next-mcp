/**
 * useAudioRecorder Hook
 * Custom hook for recording audio using the MediaRecorder API
 * Handles microphone permissions, recording state, and audio blob conversion
 */

import { useState, useRef, useCallback } from 'react';

export type RecordingState = 'idle' | 'recording' | 'stopped' | 'error';

export interface AudioRecorderError {
  type: 'permission_denied' | 'not_supported' | 'recording_failed';
  message: string;
}

export interface UseAudioRecorderReturn {
  /** Current recording state */
  state: RecordingState;
  /** Whether currently recording */
  isRecording: boolean;
  /** The recorded audio blob (available after stopping) */
  audioBlob: Blob | null;
  /** Base64 data URL of the recorded audio */
  audioDataUrl: string | null;
  /** Error if recording failed */
  error: AudioRecorderError | null;
  /** Start recording audio */
  startRecording: () => Promise<void>;
  /** Stop recording and process audio */
  stopRecording: () => void;
  /** Reset state for new recording */
  reset: () => void;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [state, setState] = useState<RecordingState>('idle');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioDataUrl, setAudioDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<AudioRecorderError | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const isRecording = state === 'recording';

  /**
   * Convert a Blob to a base64 data URL
   */
  const blobToDataUrl = useCallback((blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert blob to data URL'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }, []);

  /**
   * Clean up media stream tracks
   */
  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  /**
   * Start recording audio from the microphone
   */
  const startRecording = useCallback(async () => {
    // Reset previous state
    setError(null);
    setAudioBlob(null);
    setAudioDataUrl(null);
    chunksRef.current = [];

    // Check if MediaRecorder is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError({
        type: 'not_supported',
        message: 'Audio recording is not supported in this browser',
      });
      setState('error');
      return;
    }

    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });
      streamRef.current = stream;

      // Determine the best supported MIME type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/wav';

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = async () => {
        cleanupStream();

        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);

        try {
          const dataUrl = await blobToDataUrl(blob);
          setAudioDataUrl(dataUrl);
          setState('stopped');
        } catch (err) {
          setError({
            type: 'recording_failed',
            message: 'Failed to process recorded audio',
          });
          setState('error');
        }
      };

      // Handle errors
      mediaRecorder.onerror = () => {
        cleanupStream();
        setError({
          type: 'recording_failed',
          message: 'Recording failed unexpectedly',
        });
        setState('error');
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setState('recording');
    } catch (err) {
      cleanupStream();

      // Handle permission denied
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError({
          type: 'permission_denied',
          message: 'Microphone permission was denied. Please allow microphone access to use voice input.',
        });
      } else {
        setError({
          type: 'recording_failed',
          message: err instanceof Error ? err.message : 'Failed to start recording',
        });
      }
      setState('error');
    }
  }, [blobToDataUrl, cleanupStream]);

  /**
   * Stop recording
   */
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, [state]);

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    cleanupStream();
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current = null;
    }
    chunksRef.current = [];
    setState('idle');
    setAudioBlob(null);
    setAudioDataUrl(null);
    setError(null);
  }, [cleanupStream]);

  return {
    state,
    isRecording,
    audioBlob,
    audioDataUrl,
    error,
    startRecording,
    stopRecording,
    reset,
  };
}
