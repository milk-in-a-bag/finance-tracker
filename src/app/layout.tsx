import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SidebarNav } from "@/components/web/sidebar-nav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Finance Tracker",
  description: "Personal M-Pesa expense tracker",
};

export const viewport: Viewport = {
  themeColor: "#0f1623",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex min-h-screen bg-background">
          <SidebarNav />
          <div className="flex-1 flex flex-col min-w-0">{children}</div>
        </div>
      </body>
    </html>
  );
}
