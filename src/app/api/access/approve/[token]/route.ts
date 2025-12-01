import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { hashToken, generateTokenPair, getMagicLinkExpiry } from "@/lib/auth/tokens";
import { badRequest, notFound, serverError } from "@/lib/auth/errors";
import { sendMagicLink } from "@/lib/email/resend";
import { getAppUrl } from "@/lib/auth/session";

interface RouteParams {
  params: Promise<{ token: string }>;
}

/**
 * GET /api/access/approve/[token]
 * Admin approves an access request via tokenized link.
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { token } = await params;

    if (!token || token.length !== 64) {
      return badRequest("Invalid or expired approval link");
    }

    const tokenHash = hashToken(token);

    // Find the access request by approval token
    const accessRequest = await prisma.accessRequest.findFirst({
      where: {
        approveToken: tokenHash,
        status: "PENDING",
      },
    });

    if (!accessRequest) {
      return notFound("Access request not found or already processed");
    }

    // Generate magic link for the user
    const magicLinkPair = generateTokenPair();
    const expiresAt = getMagicLinkExpiry();

    // Create magic link record
    await prisma.magicLink.create({
      data: {
        tokenHash: magicLinkPair.tokenHash,
        email: accessRequest.email,
        expiresAt,
      },
    });

    // Update access request status to APPROVED
    await prisma.accessRequest.update({
      where: { id: accessRequest.id },
      data: { status: "APPROVED" },
    });

    // Send magic link email to user
    const appUrl = getAppUrl();
    const magicLinkUrl = `${appUrl}/api/auth/magic/${magicLinkPair.token}`;

    const emailResult = await sendMagicLink(accessRequest.email, magicLinkUrl);

    if (!emailResult.success) {
      console.error("Failed to send magic link email:", emailResult.error);
      // Don't fail the request - the approval is already recorded
    }

    // Redirect to admin confirmation page
    const redirectUrl = new URL("/auth/admin-action", appUrl);
    redirectUrl.searchParams.set("status", "approved");
    redirectUrl.searchParams.set("email", accessRequest.email);

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Approval error:", error);
    return serverError();
  }
}
