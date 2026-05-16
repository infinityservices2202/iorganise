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
  title: "EventHub - Your Premier Event Marketplace",
  description: "Discover and book event services from top organizers. Weddings, corporate events, catering, photography, and more. Your one-stop marketplace for memorable events.",
  keywords: ["EventHub", "event management", "event organizer", "wedding planner", "catering", "photography", "event marketplace"],
  authors: [{ name: "EventHub" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "EventHub - Your Premier Event Marketplace",
    description: "Discover and book event services from top organizers",
    siteName: "EventHub",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EventHub - Your Premier Event Marketplace",
    description: "Discover and book event services from top organizers",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
