import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { generateTokenPair, getMagicLinkExpiry } from "@/lib/auth/tokens";
import { badRequest, serverError } from "@/lib/auth/errors";
import { sendAdminNotification } from "@/lib/email/resend";
import { getAppUrl } from "@/lib/auth/session";

/**
 * POST /api/access/request
 * Submit a new access request for protected API endpoints.
 * Generates magic link immediately and sends to admin for forwarding.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email format
    if (!email || typeof email !== "string") {
      return badRequest("Email is required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return badRequest("Invalid email format");
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Generate magic link immediately
    const magicLinkPair = generateTokenPair();
    const expiresAt = getMagicLinkExpiry();

    // Create magic link record
    const magicLink = await prisma.magicLink.create({
      data: {
        tokenHash: magicLinkPair.tokenHash,
        email: normalizedEmail,
        expiresAt,
      },
    });

    // Create access request linked to magic link
    await prisma.accessRequest.create({
      data: {
        email: normalizedEmail,
        magicLinkId: magicLink.id,
      },
    });

    // Build magic link URL
    const appUrl = getAppUrl();
    const magicLinkUrl = `${appUrl}/api/auth/magic/${magicLinkPair.token}`;

    // Send admin notification email with magic link
    const emailResult = await sendAdminNotification(normalizedEmail, magicLinkUrl);

    if (!emailResult.success) {
      console.error("Failed to send admin notification:", emailResult.error);
      // Still return success to user - request is recorded
      // Admin can check Resend dashboard if email fails
    }

    return NextResponse.json(
      {
        message: "Access request submitted. The administrator will review your request.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Access request error:", error);
    return serverError();
  }
}
