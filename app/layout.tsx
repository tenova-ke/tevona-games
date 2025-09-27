import '../../globals.css'
import Link from 'next/link'
import { ReactNode } from 'react'

export const metadata = {
  title: 'Tevona Games',
  description: 'Multiplayer Werewolf and more powered by Supabase',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white min-h-screen">
        <header className="p-4 bg-gray-800 shadow flex gap-4">
          <Link href="/" className="font-bold">Tevona Games</Link>
          <Link href="/auth">Auth</Link>
        </header>
        <main className="p-6">{children}</main>
      </body>
    </html>
  )
}
