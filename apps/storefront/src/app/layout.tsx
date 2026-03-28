import type { Metadata } from "next";

import "./globals.css";
import { notoSansKR, inter } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "MARU | Digital Atelier",
  description: "공간에 어울리는 디지털 아뜰리에, MARU",
  icons: {
    icon: "/maru-favicon.svg",
    shortcut: "/maru-favicon.svg",
    apple: "/maru-favicon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${notoSansKR.variable} ${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
