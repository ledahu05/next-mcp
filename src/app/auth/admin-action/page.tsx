import Link from "next/link";

interface AdminActionPageProps {
  searchParams: Promise<{ status?: string; email?: string }>;
}

export default async function AdminActionPage({ searchParams }: AdminActionPageProps) {
  const { status, email } = await searchParams;

  const isApproved = status === "approved";
  const isRejected = status === "rejected";

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        {isApproved && (
          <>
            <div className="text-green-600 dark:text-green-400">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">
              Access Approved
            </h1>
            <p className="text-muted-foreground">
              You have approved access for{" "}
              <span className="font-medium text-foreground">{email}</span>.
            </p>
            <p className="text-sm text-muted-foreground">
              A magic link has been sent to their email address.
            </p>
          </>
        )}

        {isRejected && (
          <>
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
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
              Access Rejected
            </h1>
            <p className="text-muted-foreground">
              You have rejected access for{" "}
              <span className="font-medium text-foreground">{email}</span>.
            </p>
            <p className="text-sm text-muted-foreground">
              The user has not been notified.
            </p>
          </>
        )}

        {!isApproved && !isRejected && (
          <>
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
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Invalid Action</h1>
            <p className="text-muted-foreground">
              This admin action link is invalid or has already been used.
            </p>
          </>
        )}

        <div className="pt-4">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Go to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
