/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { FloatingNavbar } from "@/components/layout/FloatingNavbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

const poppins = Poppins({
  weight: ['400', '600', '800', '900'],
  variable: "--font-poppins",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CampusOS | Build. Collaborate. Succeed.",
  description: "The modern platform for college builders to collaborate, find teammates, and discover opportunities.",
};

import { BottomNavbar } from "@/components/layout/BottomNavbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Anti-FOUC: apply dark class before React hydrates */}
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            var t = localStorage.getItem('campus-theme');
            var sys = window.matchMedia('(prefers-color-scheme:dark)').matches;
            if (t === 'dark' || (!t || t === 'system') && sys) {
              document.documentElement.classList.add('dark');
            }
          } catch(e) {}
        `}} />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased selection:bg-primary-teal/30 bg-background-neutral transition-colors duration-300`}>
        <ThemeProvider>
          <AuthProvider>
            {/* Page background fill */}
            <div className="fixed inset-0 bg-background-neutral bg-page-fill -z-20 transition-colors duration-300" />
            {/* Ambient glow orbs */}
            <div className="glow-orb fixed top-0 left-1/4 w-[500px] h-[500px] bg-primary-teal/5 blur-[120px] rounded-full -z-10 animate-pulse transition-opacity duration-300" />
            <div className="glow-orb fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-secondary-coral/5 blur-[100px] rounded-full -z-10 transition-opacity duration-300" />

            <div className="hidden md:block">
              <FloatingNavbar />
              <Sidebar />
            </div>

            <main className="pb-24 pt-20 md:pt-32 md:pb-0 md:pl-28 transition-all duration-300 max-w-7xl mx-auto">
              {children}
            </main>

            <BottomNavbar />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
