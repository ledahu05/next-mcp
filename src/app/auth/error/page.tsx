import Link from "next/link";

interface AuthErrorPageProps {
  searchParams: Promise<{ reason?: string }>;
}

const errorMessages: Record<string, { title: string; description: string }> = {
  expired: {
    title: "Link Expired",
    description:
      "This magic link has expired. Magic links are valid for 24 hours. Please request access again.",
  },
  used: {
    title: "Link Already Used",
    description:
      "This magic link has already been used. Magic links can only be used once. Please request access again if needed.",
  },
  invalid: {
    title: "Invalid Link",
    description:
      "This magic link is invalid. Please check the link in your email and try again.",
  },
};

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const { reason } = await searchParams;
  const error = errorMessages[reason || ""] || {
    title: "Authentication Error",
    description: "Something went wrong with authentication. Please try again.",
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="text-red-600 dark:text-red-400">
          <svg
            className="mx-auto h-16 w-16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold">{error.title}</h1>
        <p className="text-muted-foreground">{error.description}</p>

        <div className="pt-4 space-y-2">
          <Link
            href="/access-request"
            className="block w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Request Access Again
          </Link>
          <Link
            href="/"
            className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Go to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
