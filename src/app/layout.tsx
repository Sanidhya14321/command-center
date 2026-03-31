import type { Metadata } from "next";
import { Fira_Code, Fira_Sans } from "next/font/google";
import { PageTransition } from "@/components/layout/PageTransition";
import { ThemeProvider } from "@/lib/ThemeContext";
import "./globals.css";

const firaSans = Fira_Sans({
  variable: "--font-fira-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
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
    <html lang="en" className={`${firaSans.variable} ${firaCode.variable} h-full antialiased`}>
      <body className="min-h-full bg-[var(--m3-surface)] text-[var(--m3-on-surface)]">
        <ThemeProvider>
          <PageTransition>{children}</PageTransition>
        </ThemeProvider>
      </body>
    </html>
  );
}
