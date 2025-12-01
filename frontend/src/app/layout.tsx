import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { Toaster } from "@/components/ui/sonner";
import { BrandingApi } from "@/lib/api/branding";

async function getBrandingMetadata() {
  try {
    const branding = await BrandingApi.getBrandSettings();
    return {
      title: branding.brandName || "Dashboard Application",
      description: branding.description || "Professional dashboard application with comprehensive features",
      faviconUrl: branding.faviconUrl,
    };
  } catch {
    return {
      title: "Dashboard Application",
      description: "Professional dashboard application with comprehensive features",
      faviconUrl: undefined,
    };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getBrandingMetadata();
  
  const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
    title: {
      default: branding.title,
      template: `%s | ${branding.title}`,
    },
    description: branding.description,
    keywords: ["dashboard", "admin", "management", "analytics"],
    authors: [{ name: "Dashboard Team" }],
    creator: "Dashboard Application",
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: branding.title,
      title: branding.title,
      description: branding.description,
    },
    twitter: {
      card: "summary_large_image",
      title: branding.title,
      description: branding.description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };

  if (branding.faviconUrl) {
    metadata.icons = {
      icon: branding.faviconUrl,
      shortcut: branding.faviconUrl,
      apple: branding.faviconUrl,
    };
  }

  return metadata;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Preload favicon to reduce flash on page load */}
        <link rel="preload" as="image" href="/favicon.ico" />
      </head>
      <body className="antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
