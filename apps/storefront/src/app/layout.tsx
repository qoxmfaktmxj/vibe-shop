import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans_KR } from "next/font/google";

import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["200", "400", "500", "700"],
});

const notoSans = Noto_Sans_KR({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Vibe Shop",
  description: "Search-first commerce storefront for discovery, checkout, and account journeys.",
  icons: {
    icon: "/vibe-shop-favicon.svg",
    shortcut: "/vibe-shop-favicon.svg",
    apple: "/vibe-shop-favicon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistMono.variable} ${notoSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
