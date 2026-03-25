import type { Metadata } from "next";

import "./globals.css";
import { displayFont } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Maru | Digital Atelier",
  description: "Digital Atelier storefront for discovery, checkout, and account journeys.",
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
      <body className={`${displayFont.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
