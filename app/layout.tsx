import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VPS Proxy Setup Tool",
  description: "WebArena VPSにSquidプロキシを自動構築するスクリプト生成ツール",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-950 text-gray-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
