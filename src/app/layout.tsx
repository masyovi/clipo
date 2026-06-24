import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth-provider";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Orc - Pemendek URL Cepat & Gratis",
  description: "Pemendek URL terpercaya. Ubah URL panjang jadi pendek dalam sekejap. Gratis, tanpa registrasi, dan tanpa batas.",
  keywords: ["URL shortener", "pemendek URL", "short link", "orc"],
  authors: [{ name: "Orc" }],
  icons: {
    icon: "/orc-favicon.png",
  },
  openGraph: {
    title: "Orc - Pemendek URL Cepat & Gratis",
    description: "Ubah URL panjang jadi pendek dalam sekejap.",
    siteName: "Orc",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Orc - Pemendek URL",
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
        className={`${spaceGrotesk.variable} font-[family-name:var(--font-space-grotesk)] antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
