import { Resend } from "resend";

// Lazy-initialize Resend client to avoid build-time errors
// when RESEND_API_KEY is not set
let resendClient: Resend | null = null;

function getResend(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const fromEmail = process.env.EMAIL_FROM || "noreply@resend.dev";

  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error("Failed to send email:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Email send error:", message);
    return { success: false, error: message };
  }
}

/**
 * Send access request notification to admin
 */
export async function sendAdminNotification(
  userEmail: string,
  approveUrl: string,
  rejectUrl: string
): Promise<SendEmailResult> {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    return { success: false, error: "ADMIN_EMAIL not configured" };
  }

  const html = `
    <h2>New Access Request</h2>
    <p>A user has requested access to the AI Chat feature.</p>
    <p><strong>Email:</strong> ${userEmail}</p>
    <p>
      <a href="${approveUrl}" style="display:inline-block;padding:12px 24px;background:#22c55e;color:white;text-decoration:none;border-radius:6px;margin-right:12px;">
        Approve
      </a>
      <a href="${rejectUrl}" style="display:inline-block;padding:12px 24px;background:#ef4444;color:white;text-decoration:none;border-radius:6px;">
        Reject
      </a>
    </p>
    <p style="color:#666;font-size:12px;">
      Click approve to send the user a magic link, or reject to deny access.
    </p>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `Access Request: ${userEmail}`,
    html,
  });
}

/**
 * Send magic link to approved user
 */
export async function sendMagicLink(
  userEmail: string,
  magicLinkUrl: string
): Promise<SendEmailResult> {
  const html = `
    <h2>Your Access Has Been Approved!</h2>
    <p>You can now access the AI Chat feature.</p>
    <p>
      <a href="${magicLinkUrl}" style="display:inline-block;padding:12px 24px;background:#3b82f6;color:white;text-decoration:none;border-radius:6px;">
        Access AI Chat
      </a>
    </p>
    <p style="color:#666;font-size:12px;">
      This link is valid for 24 hours and can only be used once.
    </p>
  `;

  return sendEmail({
    to: userEmail,
    subject: "Your AI Chat Access Link",
    html,
  });
}

// Export the getter instead of the client directly
export { getResend };
