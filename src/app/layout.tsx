import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Inova Thec — Portal de Gestão Pública Inteligente",
  description:
    "Sistema de auditoria e controle com tecnologia AP-04. Rastreamento veicular, patrimônio, obras, e mais — com fé pública digital e cadeia de custódia SHA-256.",
  keywords: [
    "Inova Thec",
    "gestão pública",
    "auditoria",
    "AP-04",
    "SIG-FROTA",
    "patrimônio",
    "SHA-256",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="h-full overflow-hidden" suppressHydrationWarning>{children}</body>
    </html>
  );
}
