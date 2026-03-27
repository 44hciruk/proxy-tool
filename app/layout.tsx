import type { Metadata } from "next";
import "./globals.css";
import pkg from "../package.json";

export const metadata: Metadata = {
  title: "Proxy Generator by Dr.SK",
  description: "VPS情報を入力してプロキシを自動構築します",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-950 text-gray-100 min-h-screen antialiased flex flex-col">
        <div className="flex-1">{children}</div>
        <footer className="text-center text-sm text-gray-500 py-8">
          Created by Dr.SK&nbsp;&nbsp;v{pkg.version}
        </footer>
      </body>
    </html>
  );
}
