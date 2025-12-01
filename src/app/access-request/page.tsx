import { AccessRequestForm } from "@/components/access-request-form";
import Link from "next/link";

export default function AccessRequestPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Request Access</h1>
          <p className="text-muted-foreground">
            Enter your email to request access to the AI Chat feature.
            An administrator will review your request.
          </p>
        </div>

        <div className="border rounded-lg p-6 bg-card">
          <AccessRequestForm />
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
