import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Scorify | 스포츠 AI 예측 플랫폼",
  description: "경기 결과를 예측하고 다른 사용자들과 경쟁해보세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className={`${notoSansKR.className} h-full bg-[#f4f6fb] text-[#1a1f36] antialiased`}>
        {children}
      </body>
    </html>
  );
}