import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BJK Healthcare — Enterprise Digital Brain",
    template: "%s | BJK Healthcare",
  },
  description:
    "Enterprise Pharmaceutical Operations, Workforce Intelligence & Compliance Management Platform.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#00A896",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="min-h-screen bg-[#F8FAFC] text-[#0F172A] antialiased selection:bg-[#00A896]/20 selection:text-[#00A896]">
        {children}
      </body>
    </html>
  );
}
