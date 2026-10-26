import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lingua — Học tiếng Anh cùng AI",
  description: "Luyện giao tiếp tiếng Anh theo ngành nghề cùng gia sư AI, dành cho người Việt.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
