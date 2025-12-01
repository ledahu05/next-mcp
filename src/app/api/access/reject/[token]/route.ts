import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { hashToken } from "@/lib/auth/tokens";
import { badRequest, notFound, serverError } from "@/lib/auth/errors";
import { getAppUrl } from "@/lib/auth/session";

interface RouteParams {
  params: Promise<{ token: string }>;
}

/**
 * GET /api/access/reject/[token]
 * Admin rejects an access request via tokenized link.
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { token } = await params;

    if (!token || token.length !== 64) {
      return badRequest("Invalid or expired rejection link");
    }

    const tokenHash = hashToken(token);

    // Find the access request by rejection token
    const accessRequest = await prisma.accessRequest.findFirst({
      where: {
        rejectToken: tokenHash,
        status: "PENDING",
      },
    });

    if (!accessRequest) {
      return notFound("Access request not found or already processed");
    }

    // Update access request status to REJECTED
    await prisma.accessRequest.update({
      where: { id: accessRequest.id },
      data: { status: "REJECTED" },
    });

    // No email sent to user on rejection (per spec)

    // Redirect to admin confirmation page
    const appUrl = getAppUrl();
    const redirectUrl = new URL("/auth/admin-action", appUrl);
    redirectUrl.searchParams.set("status", "rejected");
    redirectUrl.searchParams.set("email", accessRequest.email);

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Rejection error:", error);
    return serverError();
  }
}
