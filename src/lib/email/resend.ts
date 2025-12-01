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
 * Send access request notification to admin with magic link
 * Admin forwards this email to grant access
 */
export async function sendAdminNotification(
  userEmail: string,
  magicLinkUrl: string
): Promise<SendEmailResult> {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    return { success: false, error: "ADMIN_EMAIL not configured" };
  }

  const html = `
    <h2>New Access Request</h2>
    <p>A user has requested access to the AI Chat feature.</p>
    <p><strong>Email:</strong> ${userEmail}</p>

    <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e5e5;" />

    <h3>To grant access:</h3>
    <p>Forward this email to <strong>${userEmail}</strong> or share the link below:</p>
    <p>
      <a href="${magicLinkUrl}" style="display:inline-block;padding:12px 24px;background:#3b82f6;color:white;text-decoration:none;border-radius:6px;">
        Access AI Chat
      </a>
    </p>
    <p style="color:#666;font-size:12px;">
      Magic Link: <code style="background:#f3f4f6;padding:2px 6px;border-radius:4px;">${magicLinkUrl}</code>
    </p>
    <p style="color:#666;font-size:12px;">
      This link is valid for 24 hours and can only be used once.
    </p>

    <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e5e5;" />

    <p style="color:#999;font-size:11px;">
      To reject this request, simply ignore this email.
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
