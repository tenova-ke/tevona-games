import './globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'Tevona Games',
  description: 'Multiplayer Werewolf and more powered by Supabase',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white min-h-screen">
        <header className="p-4 bg-gray-800 shadow">
          <h1 className="text-2xl font-bold">Tevona Games</h1>
        </header>
        <main className="p-6">{children}</main>
      </body>
    </html>
  )
}
