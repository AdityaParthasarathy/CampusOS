import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FloatingNavbar } from "@/components/layout/FloatingNavbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CampusOS | Build. Collaborate. Succeed.",
  description: "The modern platform for college builders to collaborate, find teammates, and discover opportunities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-primary-accent/30`}>
        <div className="fixed inset-0 bg-[#020617] -z-20" />
        <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-primary-accent/10 blur-[120px] rounded-full -z-10 animate-pulse" />
        <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-highlight-accent/5 blur-[100px] rounded-full -z-10" />
        
        <FloatingNavbar />
        <main className="pt-24 lg:pt-32">
          {children}
        </main>
      </body>
    </html>
  );
}
