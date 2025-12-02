"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import type { SessionStatus } from "@/lib/auth/types";

interface AuthGateProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Client component that checks authentication status and either
 * shows children (if authenticated) or a prompt to request access.
 */
export function AuthGate({ children, fallback }: AuthGateProps) {
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch("/api/auth/session");
        const data: SessionStatus = await response.json();
        setSessionStatus(data);
      } catch (error) {
        console.error("Failed to check session:", error);
        setSessionStatus({ authenticated: false });
      } finally {
        setIsLoading(false);
      }
    }

    checkSession();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!sessionStatus?.authenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return <AccessRequestPrompt />;
  }

  return <>{children}</>;
}

function AccessRequestPrompt() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6">
      <div className="text-muted-foreground">
        <svg
          className="mx-auto h-16 w-16"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Access Required</h2>
        <p className="text-muted-foreground max-w-sm">
          The AI Chat feature requires authentication. Request access to get started.
        </p>
      </div>
      <Link
        href="/access-request"
        className="inline-flex items-center justify-center px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        Request Access
      </Link>
    </div>
  );
}

/**
 * Hook to get current authentication status
 */
export function useAuthStatus() {
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch("/api/auth/session");
        const data: SessionStatus = await response.json();
        setSessionStatus(data);
      } catch (error) {
        console.error("Failed to check session:", error);
        setSessionStatus({ authenticated: false });
      } finally {
        setIsLoading(false);
      }
    }

    checkSession();
  }, []);

  return {
    isAuthenticated: sessionStatus?.authenticated ?? false,
    email: sessionStatus?.authenticated ? sessionStatus.email : null,
    expiresAt: sessionStatus?.authenticated ? sessionStatus.expiresAt : null,
    isLoading,
  };
}
