import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
