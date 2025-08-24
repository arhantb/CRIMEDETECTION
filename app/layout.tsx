import { type Metadata } from 'next'
import './globals.css'
import CrimeReportNav from '@/components/crime-report-nav'

import type React from "react"
import { DM_Sans } from "next/font/google"

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Crime Detection System - AI-Powered Reporting",
  description:
    "Advanced crime reporting system with AI analysis and human-in-the-loop verification using LangGraph, LangChain, and Gemini API",
} 

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} antialiased`}>
        <CrimeReportNav />
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}