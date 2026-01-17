# SiteStart Landing Page

A professional landing page for an AI-powered website creation service targeting small businesses. This clean, friendly landing page collects leads through a comprehensive intake form with email notifications, plus a full admin panel for lead and customer management.

## Features

- Modern, responsive landing page built with Next.js 16 and Tailwind CSS 4
- Comprehensive intake form for collecting business information
- SQLite database for storing form submissions
- Email notifications via Gmail when forms are submitted
- CSS/HTML mockup examples showcasing different website styles
- **Admin Panel** with:
  - Password-protected authentication (JWT)
  - Dashboard with key metrics and recent activity
  - Lead tracker for managing new and contacted submissions
  - Customer tracker for paying clients with revenue tracking
  - Status workflow: NEW → CONTACTED → PAID

## Tech Stack

- **Framework:** Next.js 16 (React 19)
- **Styling:** Tailwind CSS 4
- **Database:** SQLite with Prisma ORM
- **Email:** Nodemailer with Gmail SMTP
- **Auth:** JWT with HttpOnly cookies (jose library)
- **Testing:** Vitest with React Testing Library

## Quick Start

### Prerequisites

- Node.js 18+ installed
- A Gmail account with 2FA enabled (for email notifications)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/sitestart-landing.git
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
   ```
   # Email notifications
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-app-password
   NOTIFICATION_EMAIL=your-email@gmail.com

   # Admin panel authentication
   ADMIN_PASSWORD=your-secure-admin-password
   JWT_SECRET=minimum-32-character-random-string
   ```

   To get a Gmail App Password:
   - Go to your Google Account > Security
   - Enable 2-Step Verification if not already enabled
   - Go to App passwords
   - Generate a new app password for "Mail"

5. Initialize the database:
   ```bash
   npx prisma migrate dev --name init
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
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── intake/        # Form submission API
│   │   │   └── admin/         # Admin APIs (auth, submissions, metrics)
│   │   ├── admin/             # Admin panel pages
│   │   │   ├── login/
│   │   │   └── (dashboard)/   # Protected pages (dashboard, leads, customers)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── admin/             # Admin panel components
│   │   ├── mockups/           # CSS/HTML website mockups
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Portfolio.tsx
│   │   ├── IntakeForm.tsx
│   │   └── Footer.tsx
│   ├── lib/
│   │   ├── auth/              # JWT session utilities
│   │   ├── admin/             # Admin database queries
│   │   ├── db.ts
│   │   └── email.ts
│   ├── test/                  # Test files
│   ├── types/                 # TypeScript types
│   └── middleware.ts          # Route protection
├── vitest.config.ts
├── .env.example
└── package.json
```

## Admin Panel

Access the admin panel at [http://localhost:3000/admin](http://localhost:3000/admin).

### Features

- **Dashboard**: Overview of leads, customers, revenue, and conversion rates
- **Leads**: Manage submissions with status NEW or CONTACTED
- **Customers**: View paying customers (status = PAID) with revenue tracking

### Status Workflow

```
NEW (new submission) → CONTACTED (followed up) → PAID (converted customer)
```

When marking a lead as PAID, you'll be prompted to enter the revenue amount.

## Testing

Run the test suite:

```bash
npm test          # Watch mode
npm run test:run  # Single run
```

## Customization

### Branding

Update the service name, colors, and content in the component files:
- Service name: `src/components/Header.tsx`
- Color palette: `tailwind.config.ts`
- Content: Individual component files

### Form Fields

Modify the intake form fields in:
- `src/components/IntakeForm.tsx`
- `prisma/schema.prisma` (then run `npx prisma migrate dev`)

## License

MIT
