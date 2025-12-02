"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { toast } from "sonner";
import { useAuthStatus } from "@/components/auth-gate";

interface UserMenuProps {
  onLogout?: () => void;
}

export function UserMenu({ onLogout }: UserMenuProps) {
  const { isAuthenticated, email, isLoading } = useAuthStatus();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Logged out successfully");
        onLogout?.();
        // Reload the page to reset state
        window.location.reload();
      } else {
        toast.error("Failed to log out");
      }
    } catch {
      toast.error("Network error during logout");
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 text-sm text-white/80">
        <User className="h-4 w-4" />
        <span className="hidden sm:inline max-w-[150px] truncate">{email}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="text-white/80 hover:text-white hover:bg-white/10"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline ml-1">
          {isLoggingOut ? "..." : "Logout"}
        </span>
      </Button>
    </div>
  );
}
