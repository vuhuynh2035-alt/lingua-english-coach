import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lingua — Học tiếng Anh cùng AI",
  description: "Luyện giao tiếp tiếng Anh theo ngành nghề cùng gia sư AI, dành cho người Việt.",
  manifest: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/manifest.webmanifest`,
  icons: {
    icon: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/icon.svg`,
    apple: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/apple-touch-icon.png`,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lingua",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
