import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import { WalletContextProvider } from "@/components/providers/WalletContextProvider";
import Layout from "@/components/layout/Layout";
import { ParticleBackground } from "@/components/effects/ParticleBackground";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "X Platform - AI Hedge Fund on Solana",
  description: "Next-generation AI-powered hedge fund built on Solana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable}`}>
      <body className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-text antialiased overflow-x-hidden">
        <div className="fixed inset-0 z-0">
          <ParticleBackground />
        </div>
        <WalletContextProvider>
          <Layout>{children}</Layout>
        </WalletContextProvider>
      </body>
    </html>
  );
}
