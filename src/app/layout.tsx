import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import "./globals.css";

// The slogan on the welcome page: an expressive serif with Vietnamese letters.
const slogan = Fraunces({ subsets: ["latin", "vietnamese"], style: ["italic"], weight: ["600", "700"], variable: "--font-slogan", display: "swap" });

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "Teacher AI — Học ngoại ngữ cùng AI",
  description: "Luyện giao tiếp tiếng Anh, tiếng Nhật và tiếng Trung cùng gia sư AI, dành cho người Việt.",
  manifest: `${base}/manifest.webmanifest`,
  icons: {
    icon: `${base}/icon.svg`,
    apple: `${base}/apple-touch-icon.png`,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Teacher AI",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={slogan.variable}>
      <body>{children}</body>
    </html>
  );
}
