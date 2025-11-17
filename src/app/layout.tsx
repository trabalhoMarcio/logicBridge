import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: "LogicBridge – Conecte lógica à linguagem",
    template: "%s | LogicBridge",
  },
  description:
    "Lógica IA Web: traduza entre linguagem natural (PT-BR) e lógica proposicional (CPC). Defina proposições, experimente conectivos e entenda lógica formal de forma interativa.",
  keywords: [
    "lógica proposicional",
    "CPC",
    "linguagem natural",
    "educação",
    "IA",
    "Genkit",
    "LogicBridge",
  ],
  openGraph: {
    title: "LogicBridge – Conecte lógica à linguagem",
    description:
      "Traduza frases em português para fórmulas do CPC e vice-versa. Defina proposições e aprenda lógica formal de forma prática.",
    siteName: "LogicBridge",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "LogicBridge – Conecte lógica à linguagem",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LogicBridge – Conecte lógica à linguagem",
    description:
      "Traduza NL↔CPC, defina proposições e experimente conectivos lógicos de forma interativa.",
    images: ["/og-image.svg"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} antialiased font-sans`}
      >
        <AuthProvider>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}