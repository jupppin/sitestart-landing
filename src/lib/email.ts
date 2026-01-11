import nodemailer from 'nodemailer';

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

// Create transporter for Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

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
export async function sendNotificationEmail(data: IntakeFormData): Promise<boolean> {
  // Check if email is configured
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('Email not configured. Skipping notification. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local');
    return false;
  }

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
    const transporter = createTransporter();

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.NOTIFICATION_EMAIL || process.env.GMAIL_USER,
      replyTo: data.email,
      subject: `New Inquiry: ${data.businessName} - ${formatIndustryType(data.industryType)}`,
      text: emailContent,
    });

    console.log('Notification email sent successfully to', process.env.NOTIFICATION_EMAIL || process.env.GMAIL_USER);
    return true;
  } catch (error) {
    console.error('Failed to send notification email:', error);
    return false;
  }
}
