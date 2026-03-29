import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { PageTransition } from "@/components/layout/PageTransition";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FDE + AI Engineering Command Center",
  description:
    "Premium command-center documentation hub for Forward Deployment Engineering, Data Science, and AI Engineering.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-[var(--m3-surface)] text-[var(--m3-on-surface)]">
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
