import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito } from "next/font/google";

import "@/app/globals.css";
import { ToastSystem } from "@/components/feedback/toast-system";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const heading = Baloo_2({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-heading"
});

const body = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteConfig.name
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: "/icons/apple-touch-icon.png",
    shortcut: "/icons/icon-192x192.png"
  }
};

export const viewport: Viewport = {
  themeColor: "#E5197F",
  viewportFit: "cover"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={cn(heading.variable, body.variable, "font-sans")}>
        {children}
        <ToastSystem />
      </body>
    </html>
  );
}
