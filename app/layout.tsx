import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { ManagementProvider } from "@/lib/management-context"
import { Toaster } from "@/components/ui/toaster"

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Surveil - Multi-Cloud",
  description: "Cloud optimisation and asset management dashboard",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ManagementProvider>{children}</ManagementProvider>
        <Toaster />
      </body>
    </html>
  )
}
