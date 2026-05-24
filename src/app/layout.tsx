import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "띵썸 DdingSum — 명지대 캠퍼스 소개팅",
  description:
    "명지대학교 재학생 전용 소개팅 앱. AI 썸 측정기로 너와 나의 썸 지수를 확인해보세요!",
  keywords: ["명지대", "소개팅", "썸", "매칭", "캠퍼스", "대학", "AI"],
  openGraph: {
    title: "띵썸 DdingSum — 명지대 캠퍼스 소개팅",
    description: "명지대 재학생 전용 AI 소개팅 플랫폼",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f0b1a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={geistSans.variable}>
      <body>
        {/* Background Effects */}
        <div className="bg-gradient-mesh" aria-hidden="true" />
        <div className="bg-noise" aria-hidden="true" />

        {/* Main App Content */}
        {children}
      </body>
    </html>
  );
}
