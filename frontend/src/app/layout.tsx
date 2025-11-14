import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Dashboard Application",
    template: "%s | Dashboard Application",
  },
  description: "Professional dashboard application with comprehensive features",
  keywords: ["dashboard", "admin", "management", "analytics"],
  authors: [{ name: "Dashboard Team" }],
  creator: "Dashboard Application",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Dashboard Application",
    title: "Dashboard Application",
    description: "Professional dashboard application with comprehensive features",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dashboard Application",
    description: "Professional dashboard application with comprehensive features",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
