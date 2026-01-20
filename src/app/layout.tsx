import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sky Zone - Premium PVC ID Cards",
  description: "Custom PVC ID cards for students, corporate events, and more. Professional quality, fast delivery at best prices.",
  keywords: ["Sky Zone", "PVC ID Cards", "Student ID", "Corporate ID", "Event Pass", "Custom ID Cards"],
  authors: [{ name: "Sky Zone Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Sky Zone - Premium PVC ID Cards",
    description: "Custom PVC ID cards for students, corporate events, and more. Professional quality, fast delivery at best prices.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sky Zone - Premium PVC ID Cards",
    description: "Custom PVC ID cards for students, corporate events, and more.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
