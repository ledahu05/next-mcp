import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { generateTokenPair, hashToken } from "@/lib/auth/tokens";
import { badRequest, conflict, serverError } from "@/lib/auth/errors";
import { sendAdminNotification } from "@/lib/email/resend";
import { getAppUrl } from "@/lib/auth/session";

/**
 * POST /api/access/request
 * Submit a new access request for protected API endpoints.
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

    // Check for existing pending request
    const existingRequest = await prisma.accessRequest.findFirst({
      where: {
        email: normalizedEmail,
        status: "PENDING",
      },
    });

    if (existingRequest) {
      return conflict("An access request is already pending for this email");
    }

    // Generate tokens for approve/reject links
    const approveTokenPair = generateTokenPair();
    const rejectTokenPair = generateTokenPair();

    // Create access request
    await prisma.accessRequest.create({
      data: {
        email: normalizedEmail,
        status: "PENDING",
        approveToken: hashToken(approveTokenPair.token),
        rejectToken: hashToken(rejectTokenPair.token),
      },
    });

    // Build approve/reject URLs
    const appUrl = getAppUrl();
    const approveUrl = `${appUrl}/api/access/approve/${approveTokenPair.token}`;
    const rejectUrl = `${appUrl}/api/access/reject/${rejectTokenPair.token}`;

    // Send admin notification email
    const emailResult = await sendAdminNotification(normalizedEmail, approveUrl, rejectUrl);

    if (!emailResult.success) {
      console.error("Failed to send admin notification:", emailResult.error);
      // Still return success to user - request is recorded
      // Admin can check database directly if email fails
    }

    return NextResponse.json(
      {
        message: "Access request submitted. You will receive an email when approved.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Access request error:", error);
    return serverError();
  }
}
