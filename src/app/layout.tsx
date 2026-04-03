import type { Metadata } from "next";
import { Inter, Rubik } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const body = Inter({
  variable: "--font-body",
  subsets: ["latin", "cyrillic"],
});

/** Стислі заголовки + кирилиця для укр. */
const display = Rubik({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SBD · Облік тренувань",
  description: "Журнал тренувань: присід, жим, тяга та твій план.",
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
    <html lang="uk" className={`${body.variable} ${display.variable} min-h-dvh antialiased`}>
      <body className="flex min-h-dvh flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
