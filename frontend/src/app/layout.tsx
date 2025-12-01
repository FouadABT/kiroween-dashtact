import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { Toaster } from "@/components/ui/sonner";
import { BrandingApi } from "@/lib/api/branding";
import { 
  Inter, 
  Roboto, 
  Open_Sans, 
  Lato, 
  Poppins, 
  Montserrat, 
  Source_Sans_3,
  Nunito,
  Merriweather,
  Playfair_Display,
  Lora,
  PT_Serif,
  Crimson_Text,
  Source_Serif_4,
  Fira_Code,
  JetBrains_Mono,
  Source_Code_Pro,
  IBM_Plex_Mono
} from "next/font/google";

// Sans Serif Fonts
const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: "swap",
});

const roboto = Roboto({ 
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"], 
  variable: "--font-roboto",
  display: "swap",
});

const openSans = Open_Sans({ 
  subsets: ["latin"], 
  variable: "--font-open-sans",
  display: "swap",
});

const lato = Lato({ 
  weight: ["300", "400", "700"],
  subsets: ["latin"], 
  variable: "--font-lato",
  display: "swap",
});

const poppins = Poppins({ 
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"], 
  variable: "--font-poppins",
  display: "swap",
});

const montserrat = Montserrat({ 
  subsets: ["latin"], 
  variable: "--font-montserrat",
  display: "swap",
});

const sourceSans = Source_Sans_3({ 
  subsets: ["latin"], 
  variable: "--font-source-sans",
  display: "swap",
});

const nunito = Nunito({ 
  subsets: ["latin"], 
  variable: "--font-nunito",
  display: "swap",
});

// Serif Fonts
const merriweather = Merriweather({ 
  weight: ["300", "400", "700"],
  subsets: ["latin"], 
  variable: "--font-merriweather",
  display: "swap",
});

const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-playfair",
  display: "swap",
});

const lora = Lora({ 
  subsets: ["latin"], 
  variable: "--font-lora",
  display: "swap",
});

const ptSerif = PT_Serif({ 
  weight: ["400", "700"],
  subsets: ["latin"], 
  variable: "--font-pt-serif",
  display: "swap",
});

const crimsonText = Crimson_Text({ 
  weight: ["400", "600", "700"],
  subsets: ["latin"], 
  variable: "--font-crimson-text",
  display: "swap",
});

const sourceSerif = Source_Serif_4({ 
  subsets: ["latin"], 
  variable: "--font-source-serif",
  display: "swap",
});

// Monospace Fonts
const firaCode = Fira_Code({ 
  subsets: ["latin"], 
  variable: "--font-fira-code",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const sourceCodePro = Source_Code_Pro({ 
  subsets: ["latin"], 
  variable: "--font-source-code-pro",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({ 
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"], 
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

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
  // Combine all font variables for the html element
  const fontVariables = [
    // Sans Serif
    inter.variable,
    roboto.variable,
    openSans.variable,
    lato.variable,
    poppins.variable,
    montserrat.variable,
    sourceSans.variable,
    nunito.variable,
    // Serif
    merriweather.variable,
    playfair.variable,
    lora.variable,
    ptSerif.variable,
    crimsonText.variable,
    sourceSerif.variable,
    // Monospace
    firaCode.variable,
    jetbrainsMono.variable,
    sourceCodePro.variable,
    ibmPlexMono.variable,
  ].join(' ');

  return (
    <html lang="en" suppressHydrationWarning className={fontVariables}>
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
