/**
 * useAudioRecorder Hook
 * Custom hook for recording audio using the MediaRecorder API
 * Handles microphone permissions, recording state, audio blob conversion,
 * and automatic silence detection to stop recording
 */

import { useState, useRef, useCallback, useEffect } from 'react';

export type RecordingState = 'idle' | 'recording' | 'stopped' | 'error';

export interface AudioRecorderError {
  type: 'permission_denied' | 'not_supported' | 'recording_failed';
  message: string;
}

export interface SilenceDetectionOptions {
  /** Enable automatic silence detection */
  enabled: boolean;
  /** Audio level below this is considered silence (0-255, default: 30) */
  silenceThreshold: number;
  /** Milliseconds of silence before auto-stop (default: 1500) */
  silenceDuration: number;
  /** Minimum recording time before silence detection kicks in (default: 500ms) */
  minRecordingTime: number;
}

export interface UseAudioRecorderOptions {
  /** Silence detection configuration */
  silenceDetection?: Partial<SilenceDetectionOptions>;
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
  /** Current audio level (0-255) for visual feedback */
  audioLevel: number;
  /** Start recording audio */
  startRecording: () => Promise<void>;
  /** Stop recording and process audio */
  stopRecording: () => void;
  /** Reset state for new recording */
  reset: () => void;
}

const DEFAULT_SILENCE_OPTIONS: SilenceDetectionOptions = {
  enabled: true,
  silenceThreshold: 30,
  silenceDuration: 1500,
  minRecordingTime: 500,
};

export function useAudioRecorder(options?: UseAudioRecorderOptions): UseAudioRecorderReturn {
  const silenceOptions: SilenceDetectionOptions = {
    ...DEFAULT_SILENCE_OPTIONS,
    ...options?.silenceDetection,
  };

  const [state, setState] = useState<RecordingState>('idle');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioDataUrl, setAudioDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<AudioRecorderError | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Silence detection refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceStartRef = useRef<number | null>(null);
  const recordingStartRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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
   * Clean up all resources
   */
  const cleanup = useCallback(() => {
    // Stop animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Reset timing refs
    silenceStartRef.current = null;
    recordingStartRef.current = null;
    setAudioLevel(0);
  }, []);

  /**
   * Monitor audio levels for silence detection
   */
  const monitorAudioLevel = useCallback(() => {
    if (!analyserRef.current || state !== 'recording') {
      return;
    }

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    // Calculate average audio level
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    setAudioLevel(Math.round(average));

    // Silence detection logic
    if (silenceOptions.enabled) {
      const now = Date.now();
      const recordingDuration = recordingStartRef.current ? now - recordingStartRef.current : 0;

      // Only check for silence after minimum recording time
      if (recordingDuration >= silenceOptions.minRecordingTime) {
        if (average < silenceOptions.silenceThreshold) {
          // Start tracking silence
          if (silenceStartRef.current === null) {
            silenceStartRef.current = now;
          } else {
            // Check if silence duration exceeded
            const silenceDuration = now - silenceStartRef.current;
            if (silenceDuration >= silenceOptions.silenceDuration) {
              // Auto-stop recording
              if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
              }
              return;
            }
          }
        } else {
          // Reset silence tracking when sound detected
          silenceStartRef.current = null;
        }
      }
    }

    // Continue monitoring
    animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
  }, [state, silenceOptions]);

  /**
   * Start recording audio from the microphone
   */
  const startRecording = useCallback(async () => {
    // Reset previous state
    setError(null);
    setAudioBlob(null);
    setAudioDataUrl(null);
    chunksRef.current = [];
    silenceStartRef.current = null;

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

      // Set up audio analysis for silence detection
      if (silenceOptions.enabled) {
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        source.connect(analyser);
        analyserRef.current = analyser;
      }

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
        cleanup();

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
        cleanup();
        setError({
          type: 'recording_failed',
          message: 'Recording failed unexpectedly',
        });
        setState('error');
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      recordingStartRef.current = Date.now();
      setState('recording');

      // Start monitoring audio levels
      if (silenceOptions.enabled) {
        animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
      }
    } catch (err) {
      cleanup();

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
  }, [blobToDataUrl, cleanup, silenceOptions, monitorAudioLevel]);

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
    cleanup();
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current = null;
    }
    chunksRef.current = [];
    setState('idle');
    setAudioBlob(null);
    setAudioDataUrl(null);
    setError(null);
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    state,
    isRecording,
    audioBlob,
    audioDataUrl,
    error,
    audioLevel,
    startRecording,
    stopRecording,
    reset,
  };
}
