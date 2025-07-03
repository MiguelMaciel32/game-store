import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "GameVerse - Compre seu jogo ou sua conta FA com os melhores preços do mercado",
  description: "Compre seu jogo ou sua conta FA com os melhores preços do mercado",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  )
}
