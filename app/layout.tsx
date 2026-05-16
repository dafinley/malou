import type { Metadata, Viewport } from "next";
import { themeInitScript } from "@/src/lib/theme";
import "./globals.css";

// Production deploys should set NEXT_PUBLIC_SITE_URL so OG / Twitter cards
// resolve image URLs against the real host. The fallback is a sane local guess.
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const siteName = "Molou";
const defaultTitle = "Molou · Model Training Visualizer";
const defaultDescription =
  "A visual workbench for understanding full training, adapter fine-tuning, QLoRA, distillation, reinforcement learning, inference, and model architecture tradeoffs.";
const socialDescription =
  "Inspect how training methods differ: what moves, what stays frozen, where memory goes, and what the signal looks like.";
const socialImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: defaultTitle,
  type: "image/png"
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  creator: "Molou contributors",
  publisher: "Molou contributors",
  category: "education",
  classification: "Machine learning education",
  title: {
    default: defaultTitle,
    template: "%s · Molou"
  },
  description: defaultDescription,
  keywords: [
    "machine learning",
    "LLM",
    "LoRA",
    "QLoRA",
    "distillation",
    "RLHF",
    "training visualization",
    "education"
  ],
  authors: [{ name: "Molou contributors" }],
  alternates: {
    canonical: siteUrl
  },
  openGraph: {
    title: defaultTitle,
    description: socialDescription,
    url: siteUrl,
    siteName,
    type: "website",
    locale: "en_US",
    images: [socialImage]
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: socialDescription,
    images: [socialImage]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  }
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7ec" },
    { media: "(prefers-color-scheme: dark)", color: "#11110f" }
  ],
  colorScheme: "light dark"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
