import type { Metadata } from "next";

import "./globals.css";
import { gowunBatang, notoSansKR } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "MARU | 조용한 일상을 위한 리빙 셀렉션",
  description: "좋은 소재와 편안한 형태로 완성하는 프리미엄 리빙 셀렉션, MARU",
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
      <body className={`${notoSansKR.variable} ${gowunBatang.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
