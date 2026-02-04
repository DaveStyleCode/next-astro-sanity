import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeScript } from "@/components/ThemeScript"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "D.R. Horton",
    template: "%s | D.R. Horton",
  },
  description: "A modern, fast, and beautiful site built with Next.js and Sanity CMS.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-bg text-text antialiased`}>{children}</body>
    </html>
  )
}
