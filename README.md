# SiteStart Landing Page

A professional landing page for an AI-powered website creation service targeting small businesses. Includes a comprehensive intake form, email notifications, and a full admin panel for managing leads, customers, files, and deployments.

## Features

### Landing Page
- Modern, responsive design built with Next.js 15 and Tailwind CSS 4
- Comprehensive intake form for collecting business information
- Email notifications via Gmail when forms are submitted
- CSS/HTML mockup examples showcasing different website styles

### Admin Panel
- Password-protected authentication (JWT)
- Dashboard with key metrics and recent activity
- Lead tracker for managing new and contacted submissions
- Customer tracker for paying clients with Stripe integration
- Status workflow: NEW → CONTACTED → PAID

### Customer Management
- **Notes/CRM**: Track calls, meetings, emails, and general notes per customer
- **File Storage**: Upload and organize customer assets (logos, photos, documents)
- **Cloudflare Deployment**: Deploy customer sites to Cloudflare Pages with custom domain DNS configuration

## Tech Stack

- **Framework:** Next.js 15 (React 19)
- **Styling:** Tailwind CSS 4
- **Database:** SQLite with Prisma ORM
- **Email:** Nodemailer with Gmail SMTP
- **Auth:** JWT with HttpOnly cookies (jose library)
- **Payments:** Stripe (subscriptions and billing)
- **Hosting:** Cloudflare Pages API
- **File Storage:** Local filesystem (with abstraction for future cloud migration)
- **Testing:** Vitest with React Testing Library

## Quick Start

### Prerequisites

- Node.js 18+ installed
- A Gmail account with 2FA enabled (for email notifications)
- Cloudflare account (for deployment features)
- Stripe account (for payment features)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/jupppin/sitestart-landing.git
   cd sitestart-landing
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Edit `.env.local` with your credentials:
   ```env
   # Email notifications
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-app-password
   NOTIFICATION_EMAIL=your-email@gmail.com

   # Admin panel authentication
   ADMIN_PASSWORD=your-secure-admin-password
   JWT_SECRET=minimum-32-character-random-string

   # Cloudflare (for deployments)
   CLOUDFLARE_API_TOKEN=your-cloudflare-api-token
   CLOUDFLARE_ACCOUNT_ID=your-account-id

   # Stripe (for payments)
   STRIPE_SECRET_KEY=sk_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...

   # File Storage
   UPLOAD_DIR=./uploads
   MAX_FILE_SIZE=10485760
   ```

5. Initialize the database:
   ```bash
   npx prisma migrate dev
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── migrations/                # Database migrations
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── intake/            # Form submission API
│   │   │   └── admin/             # Admin APIs
│   │   │       ├── auth/          # Authentication
│   │   │       ├── submissions/   # Lead management
│   │   │       └── customers/[id]/
│   │   │           ├── notes/     # Customer notes API
│   │   │           ├── files/     # File upload/download API
│   │   │           └── deployment/ # Cloudflare deployment API
│   │   ├── admin/                 # Admin panel pages
│   │   │   ├── login/
│   │   │   └── (dashboard)/       # Protected pages
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── admin/
│   │   │   ├── customers/         # Customer detail views
│   │   │   ├── notes/             # Notes/CRM components
│   │   │   ├── files/             # File management components
│   │   │   └── deployment/        # Deployment UI components
│   │   └── mockups/               # CSS/HTML website mockups
│   ├── lib/
│   │   ├── auth/                  # JWT session utilities
│   │   ├── admin/                 # Database queries
│   │   │   ├── queries.ts         # General queries
│   │   │   ├── noteQueries.ts     # Notes CRUD
│   │   │   ├── fileQueries.ts     # Files CRUD
│   │   │   └── deploymentQueries.ts
│   │   ├── cloudflare.ts          # Cloudflare API integration
│   │   ├── storage.ts             # File storage abstraction
│   │   ├── stripe.ts              # Stripe integration
│   │   └── email.ts               # Email notifications
│   └── types/
│       └── admin.ts               # TypeScript types
├── uploads/                       # Customer file storage (gitignored)
└── package.json
```

## Admin Panel

Access the admin panel at [http://localhost:3000/admin](http://localhost:3000/admin).

### Dashboard
Overview of leads, customers, revenue, and conversion rates.

### Leads
Manage submissions with status NEW or CONTACTED.

### Customers
View paying customers (status = PAID) with:
- **Overview Tab**: Contact info, business details, revenue
- **Notes Tab**: CRM with call/meeting/email tracking
- **Files Tab**: Upload logos, photos, documents
- **Deployment Tab**: Deploy to Cloudflare Pages with custom domains

### Status Workflow

```
NEW (new submission) → CONTACTED (followed up) → PAID (converted customer)
```

## Cloudflare Setup

To use the deployment features:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Get your Account ID from the right sidebar on the Overview page
3. Create an API Token: My Profile → API Tokens → Create Token
   - Use "Edit Cloudflare Pages" template, or create custom with:
   - Pages: Edit
   - Zone DNS: Edit (for custom domains)
4. Add domains you'll use for customers to your Cloudflare account

The system automatically looks up Zone IDs by domain name, so you can manage multiple customer domains from one account.

## Stripe Setup

For payment and subscription features:

1. Create a [Stripe account](https://stripe.com)
2. Get your API keys from the Developers section
3. Set up a webhook endpoint pointing to `/api/webhooks/stripe`
4. Configure your products and pricing in Stripe Dashboard

## File Storage

Customer files are stored locally in `./uploads/customers/{customerId}/`:
- `logos/` - Brand logos
- `photos/` - Product/team photos
- `content/` - Text content, copy
- `documents/` - Contracts, briefs
- `general/` - Other files

The storage system uses an abstraction layer (`src/lib/storage.ts`) for easy migration to cloud storage (S3, Cloudflare R2) in the future.

## Testing

```bash
npm test          # Watch mode
npm run test:run  # Single run
```

## Customization

### Branding
- Service name: `src/components/Header.tsx`
- Color palette: `tailwind.config.ts`
- Content: Individual component files

### Form Fields
Modify the intake form:
1. Update `src/components/IntakeForm.tsx`
2. Update `prisma/schema.prisma`
3. Run `npx prisma migrate dev`

## License

MIT
