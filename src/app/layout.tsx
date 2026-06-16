import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pendek.in - Pemendek URL Cepat & Gratis",
  description: "Pemendek URL terpercaya. Ubah URL panjang jadi pendek dalam sekejap. Gratis, tanpa registrasi, dan tanpa batas.",
  keywords: ["URL shortener", "pemendek URL", "short link", "bitly", "pendekin"],
  authors: [{ name: "Pendek.in" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Pendek.in - Pemendek URL Cepat & Gratis",
    description: "Ubah URL panjang jadi pendek dalam sekejap.",
    siteName: "Pendek.in",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pendek.in - Pemendek URL",
    description: "Ubah URL panjang jadi pendek dalam sekejap.",
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
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}