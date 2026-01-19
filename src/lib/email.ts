import { Resend } from 'resend';

// Form data interface - matches what the API route passes after database save
export interface IntakeFormData {
  submissionId: number;
  fullName: string;
  email: string;
  phone?: string | null;
  businessName: string;
  industryType: string;
  currentWebsite?: string | null;
  hasNoWebsite: boolean;
  features: string[];
  otherFeatures?: string | null;
  budgetRange: string;
  timeline: string;
  additionalInfo?: string | null;
  createdAt: Date;
}

// Initialize Resend client
const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
};

// Default from email (can be overridden with RESEND_FROM_EMAIL env var)
const getFromEmail = () => process.env.RESEND_FROM_EMAIL || 'noreply@sitestart.dev';

// Format features list for email
const formatFeatures = (features: string[], otherFeatures?: string): string => {
  if (features.length === 0) {
    return 'None selected';
  }

  const featureLabels: Record<string, string> = {
    'ecommerce': 'Online store / E-commerce',
    'booking': 'Appointment booking',
    'contact': 'Contact form',
    'gallery': 'Photo gallery',
    'blog': 'Blog',
    'menu': 'Menu / Services list',
    'reviews': 'Customer reviews',
    'other': 'Other',
  };

  const formatted = features.map(f => featureLabels[f] || f).join(', ');

  if (otherFeatures && features.includes('other')) {
    return `${formatted}\n  Other details: ${otherFeatures}`;
  }

  return formatted;
};

// Format budget range for email
const formatBudgetRange = (budget: string): string => {
  const budgetLabels: Record<string, string> = {
    'under-500': 'Under $500',
    '500-1000': '$500 - $1,000',
    '1000-2500': '$1,000 - $2,500',
    '2500-plus': '$2,500+',
    'not-sure': 'Not sure yet',
  };
  return budgetLabels[budget] || budget;
};

// Format timeline for email
const formatTimeline = (timeline: string): string => {
  const timelineLabels: Record<string, string> = {
    'asap': 'ASAP (within 2 weeks)',
    '1-2-months': '1-2 months',
    '3-plus-months': '3+ months',
    'exploring': 'Just exploring',
  };
  return timelineLabels[timeline] || timeline;
};

// Format industry type for email
const formatIndustryType = (industry: string): string => {
  const industryLabels: Record<string, string> = {
    'retail': 'Retail',
    'restaurant': 'Restaurant / Food Service',
    'professional': 'Professional Services',
    'health': 'Health & Wellness',
    'home-services': 'Home Services',
    'other': 'Other',
  };
  return industryLabels[industry] || industry;
};

/**
 * Send a notification email when a new intake form is submitted.
 * Returns true if email was sent successfully, false otherwise.
 * This function does NOT throw errors - it just logs and returns false on failure.
 */
/**
 * Generic email sending function.
 * Returns true if email was sent successfully, false otherwise.
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<boolean> {
  const resend = getResendClient();

  if (!resend) {
    console.warn('[Email] Resend not configured. Set RESEND_API_KEY environment variable.');
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: getFromEmail(),
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
      replyTo: process.env.NOTIFICATION_EMAIL,
    });

    if (error) {
      console.error('[Email] Failed to send:', error.message);
      return false;
    }

    console.log('[Email] Sent successfully to', to);
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Email] Failed to send:', errorMessage);
    return false;
  }
}

// ============================================================================
// Payment Email Templates
// ============================================================================

/**
 * Payment Link Email Template
 * Sent when admin generates a setup fee payment link
 */
export function getPaymentLinkEmailTemplate(customerName: string, paymentUrl: string): {
  subject: string;
  html: string;
} {
  const subject = 'Your SiteStart Setup Fee Payment Link';
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">SiteStart</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 20px; font-weight: 600;">Hello ${customerName},</h2>
              <p style="margin: 0 0 20px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Thank you for choosing SiteStart for your website project. Your setup fee payment link is ready.
              </p>
              <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin: 25px 0;">
                <p style="margin: 0 0 10px 0; color: #6a6a6a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Setup Fee Amount</p>
                <p style="margin: 0; color: #1a1a1a; font-size: 32px; font-weight: 700;">$200.00</p>
              </div>
              <p style="margin: 0 0 25px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Click the button below to complete your payment securely:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${paymentUrl}" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 16px; font-weight: 600;">Pay Now</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 25px 0 0 0; color: #6a6a6a; font-size: 14px; line-height: 1.6;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${paymentUrl}" style="color: #1a1a1a; word-break: break-all;">${paymentUrl}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 25px 40px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; color: #6a6a6a; font-size: 14px;">
                Questions? Reply to this email and we'll help you out.
              </p>
              <p style="margin: 10px 0 0 0; color: #9a9a9a; font-size: 12px;">
                SiteStart - Professional websites for small businesses
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return { subject, html };
}

/**
 * Subscription Link Email Template
 * Sent when admin generates a subscription link
 */
export function getSubscriptionLinkEmailTemplate(customerName: string, subscriptionUrl: string): {
  subject: string;
  html: string;
} {
  const subject = 'Your SiteStart Subscription Setup';
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">SiteStart</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 20px; font-weight: 600;">Hello ${customerName},</h2>
              <p style="margin: 0 0 20px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Your website is ready to go live! Set up your monthly subscription to keep your site running smoothly.
              </p>
              <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin: 25px 0;">
                <p style="margin: 0 0 10px 0; color: #6a6a6a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Monthly Subscription</p>
                <p style="margin: 0 0 15px 0; color: #1a1a1a; font-size: 32px; font-weight: 700;">$29<span style="font-size: 16px; font-weight: 400; color: #6a6a6a;">/month</span></p>
                <ul style="margin: 0; padding: 0 0 0 20px; color: #4a4a4a; font-size: 14px; line-height: 1.8;">
                  <li>Premium website hosting</li>
                  <li>Regular updates and maintenance</li>
                  <li>Priority email support</li>
                  <li>SSL certificate included</li>
                  <li>Daily backups</li>
                </ul>
              </div>
              <p style="margin: 0 0 25px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Click the button below to set up your subscription:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${subscriptionUrl}" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 16px; font-weight: 600;">Start Subscription</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 25px 0 0 0; color: #6a6a6a; font-size: 14px; line-height: 1.6;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${subscriptionUrl}" style="color: #1a1a1a; word-break: break-all;">${subscriptionUrl}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 25px 40px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; color: #6a6a6a; font-size: 14px;">
                Questions? Reply to this email and we'll help you out.
              </p>
              <p style="margin: 10px 0 0 0; color: #9a9a9a; font-size: 12px;">
                SiteStart - Professional websites for small businesses
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return { subject, html };
}

/**
 * Payment Confirmation Email Template
 * Sent after successful setup fee payment
 */
export function getPaymentConfirmationEmailTemplate(customerName: string): {
  subject: string;
  html: string;
} {
  const subject = 'Payment Confirmed - SiteStart';
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">SiteStart</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <div style="text-align: center; margin-bottom: 25px;">
                <div style="display: inline-block; background-color: #d4edda; border-radius: 50%; padding: 15px;">
                  <span style="font-size: 32px;">&#10003;</span>
                </div>
              </div>
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 20px; font-weight: 600; text-align: center;">Payment Confirmed!</h2>
              <p style="margin: 0 0 20px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Hello ${customerName},
              </p>
              <p style="margin: 0 0 20px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Thank you for your payment! We've received your $200 setup fee and your project is now officially underway.
              </p>
              <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin: 25px 0;">
                <p style="margin: 0 0 15px 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">What happens next:</p>
                <ol style="margin: 0; padding: 0 0 0 20px; color: #4a4a4a; font-size: 14px; line-height: 1.8;">
                  <li>We'll begin designing your website based on your requirements</li>
                  <li>You'll receive design mockups for review within 5-7 business days</li>
                  <li>After your approval, we'll build and launch your site</li>
                  <li>You'll receive a subscription link to activate monthly hosting</li>
                </ol>
              </div>
              <p style="margin: 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                We're excited to build something great for your business!
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 25px 40px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; color: #6a6a6a; font-size: 14px;">
                Questions? Reply to this email and we'll help you out.
              </p>
              <p style="margin: 10px 0 0 0; color: #9a9a9a; font-size: 12px;">
                SiteStart - Professional websites for small businesses
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return { subject, html };
}

/**
 * Subscription Confirmation Email Template
 * Sent after subscription setup
 */
export function getSubscriptionConfirmationEmailTemplate(
  customerName: string,
  billingDate: string
): {
  subject: string;
  html: string;
} {
  const subject = 'Subscription Active - SiteStart';
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">SiteStart</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <div style="text-align: center; margin-bottom: 25px;">
                <div style="display: inline-block; background-color: #d4edda; border-radius: 50%; padding: 15px;">
                  <span style="font-size: 32px;">&#10003;</span>
                </div>
              </div>
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 20px; font-weight: 600; text-align: center;">Subscription Active!</h2>
              <p style="margin: 0 0 20px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Hello ${customerName},
              </p>
              <p style="margin: 0 0 20px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Your SiteStart subscription is now active. Your website is live and we'll take care of everything to keep it running smoothly.
              </p>
              <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin: 25px 0;">
                <p style="margin: 0 0 15px 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">Subscription Details</p>
                <table style="width: 100%; font-size: 14px; color: #4a4a4a;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;">Plan</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; text-align: right; font-weight: 600;">SiteStart Monthly</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;">Amount</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; text-align: right; font-weight: 600;">$29/month</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">Next Billing Date</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600;">${billingDate}</td>
                  </tr>
                </table>
              </div>
              <div style="background-color: #fff3cd; border-radius: 6px; padding: 15px; margin: 25px 0;">
                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                  <strong>Cancellation Policy:</strong> You can cancel your subscription at any time by contacting us. Your site will remain active until the end of your current billing period.
                </p>
              </div>
              <p style="margin: 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Thank you for trusting SiteStart with your online presence!
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 25px 40px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; color: #6a6a6a; font-size: 14px;">
                Questions? Reply to this email and we'll help you out.
              </p>
              <p style="margin: 10px 0 0 0; color: #9a9a9a; font-size: 12px;">
                SiteStart - Professional websites for small businesses
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return { subject, html };
}

// ============================================================================
// Notification Email (Original)
// ============================================================================

/**
 * Send a notification email when a new intake form is submitted.
 * Returns true if email was sent successfully, false otherwise.
 * This function does NOT throw errors - it just logs and returns false on failure.
 */
export async function sendNotificationEmail(data: IntakeFormData): Promise<boolean> {
  const resend = getResendClient();

  if (!resend) {
    console.warn('[Email] Resend not configured. Set RESEND_API_KEY environment variable.');
    return false;
  }

  const notificationEmail = process.env.NOTIFICATION_EMAIL;
  if (!notificationEmail) {
    console.warn('[Email] NOTIFICATION_EMAIL not set. Skipping notification.');
    return false;
  }

  console.log(`[Email] Attempting to send notification to ${notificationEmail}`);

  const timestamp = data.createdAt.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  const emailContent = `
New Website Inquiry from SiteStart
Submission ID: #${data.submissionId}

=== Contact Information ===
Name: ${data.fullName}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}

=== Business Details ===
Business Name: ${data.businessName}
Industry: ${formatIndustryType(data.industryType)}
Current Website: ${data.hasNoWebsite ? "Doesn't have one" : (data.currentWebsite || 'Not provided')}

=== Project Requirements ===
Features Needed: ${formatFeatures(data.features, data.otherFeatures || undefined)}
Budget Range: ${formatBudgetRange(data.budgetRange)}
Timeline: ${formatTimeline(data.timeline)}

=== Additional Information ===
${data.additionalInfo || 'None provided'}

---
Submitted at: ${timestamp}
This is an automated notification from SiteStart Landing Page.
  `.trim();

  try {
    const { error } = await resend.emails.send({
      from: getFromEmail(),
      to: notificationEmail,
      replyTo: data.email,
      subject: `New Inquiry: ${data.businessName} - ${formatIndustryType(data.industryType)}`,
      text: emailContent,
    });

    if (error) {
      console.error(`[Email] Failed to send notification: ${error.message}`);
      return false;
    }

    console.log('[Email] Notification sent successfully to', notificationEmail);
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Email] Failed to send notification: ${errorMessage}`);
    return false;
  }
}
