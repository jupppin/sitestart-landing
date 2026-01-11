import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SiteStart - AI Website Builder for Small Businesses",
  description: "Get a professional, custom website for your small business. Our AI-powered platform builds beautiful websites fast and affordably. No tech skills needed.",
  keywords: ["website builder", "small business", "AI website", "professional website", "affordable web design"],
  authors: [{ name: "SiteStart" }],
  openGraph: {
    title: "SiteStart - AI Website Builder for Small Businesses",
    description: "Get a professional, custom website for your small business. Our AI-powered platform builds beautiful websites fast and affordably.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SiteStart - AI Website Builder for Small Businesses",
    description: "Get a professional, custom website for your small business. Our AI-powered platform builds beautiful websites fast and affordably.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
