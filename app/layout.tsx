import type React from "react"
import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"
import "./globals.css"

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
})

export const metadata: Metadata = {
  title: "Médicos para Todos",
  description: "Conectando você à saúde - Telemedicina para regiões de difícil acesso",
  generator: "v0.app",
  manifest: "/manifest.json",
  themeColor: "#15803d",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Médicos para Todos",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Médicos para Todos",
    title: "Médicos para Todos",
    description: "Conectando você à saúde - Telemedicina para regiões de difícil acesso",
  },
  twitter: {
    card: "summary",
    title: "Médicos para Todos",
    description: "Conectando você à saúde - Telemedicina para regiões de difícil acesso",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${dmSans.variable} antialiased`}>
      <head>
        <meta name="application-name" content="Médicos para Todos" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MedTodos" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#15803d" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-192.png" />
        <link rel="mask-icon" href="/icon-192.png" color="#15803d" />
        <link rel="shortcut icon" href="/icon-192.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}
