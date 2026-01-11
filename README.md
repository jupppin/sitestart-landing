# SiteStart Landing Page

A professional landing page for an AI-powered website creation service targeting small businesses. This clean, friendly landing page collects leads through a comprehensive intake form with email notifications.

## Features

- Modern, responsive landing page built with Next.js 14 and Tailwind CSS
- Comprehensive intake form for collecting business information
- SQLite database for storing form submissions
- Email notifications via Gmail when forms are submitted
- CSS/HTML mockup examples showcasing different website styles

## Tech Stack

- **Framework:** Next.js 14 (React)
- **Styling:** Tailwind CSS
- **Database:** SQLite with Prisma ORM
- **Email:** Nodemailer with Gmail SMTP

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

4. Edit `.env.local` with your Gmail credentials:
   ```
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-app-password
   NOTIFICATION_EMAIL=your-email@gmail.com
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
│   └── schema.prisma       # Database schema
├── src/
│   ├── app/
│   │   ├── api/intake/     # Form submission API
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Portfolio.tsx
│   │   ├── mockups/        # CSS/HTML website mockups
│   │   ├── IntakeForm.tsx
│   │   └── Footer.tsx
│   └── lib/
│       ├── db.ts           # Prisma client
│       └── email.ts        # Email configuration
├── .env.example
└── package.json
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
