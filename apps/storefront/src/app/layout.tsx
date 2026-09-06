import type { Metadata } from "next";
import Link from "next/link";

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
        <noscript>
          <style>{".app-loading { display: none; }"}</style>
          <section aria-labelledby="no-script-title" className="no-script-notice page-container">
            <h1 id="no-script-title" className="display-heading text-3xl">브라우저 설정을 확인해 주세요</h1>
            <p>현재 브라우저 설정으로는 쇼핑 기능을 사용할 수 없습니다.</p>
            <p>브라우저 설정에서 JavaScript를 허용한 뒤 다시 열어 주세요.</p>
            <Link href="/" className="button-primary mt-6 px-6 py-3">설정 후 다시 열기</Link>
          </section>
        </noscript>
        {children}
      </body>
    </html>
  );
}
