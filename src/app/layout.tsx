import type { Metadata } from "next";
import { Inter, Rubik } from "next/font/google";
import Script from "next/script";
import { Providers } from "@/components/Providers";
import { THEME_BOOT_SCRIPT } from "@/lib/theme";
import "./globals.css";

const body = Inter({
  variable: "--font-body",
  subsets: ["latin", "cyrillic"],
});

const display = Rubik({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SBD · Облік тренувань",
  description: "Тренування: присід, жим, тяга та твій план.",
  applicationName: "SBD",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SBD",
  },
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/icon.svg" }],
  },
};

export const viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uk"
      suppressHydrationWarning
      className={`${body.variable} ${display.variable} min-h-dvh antialiased`}
    >
      <body className="relative isolate flex min-h-dvh flex-col font-sans">
        <div className="sbd-ambient" aria-hidden="true">
          <span className="sbd-ambient__grain" />
        </div>
        <Script
          id="sbd-theme-boot"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }}
        />
        <div className="relative z-[1] flex min-h-dvh flex-col">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
