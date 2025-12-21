import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import AuthProvider from "./providers/AuthProvider";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

const notoSans = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-noto-sans-kr",
});

export const metadata: Metadata = {
  title: "SKHU-LINK",
  description: "성공회대학교 수업 커뮤니티 SKHU-LINK",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${notoSans.variable} font-sans antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          {/* 메인 컨텐츠 영역 */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
