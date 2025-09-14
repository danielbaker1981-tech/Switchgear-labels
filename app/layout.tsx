import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Switchgear Labels',
  description: 'Design & order engraved labels for electrical switchgear',
  icons: { icon:'/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }){
  const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASS || 'switch'
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&display=swap" rel="stylesheet"/>
        <script dangerouslySetInnerHTML={{__html: `window.__ADMIN_PASS__ = ${JSON.stringify(adminPass)};`}} />
      </head>
      <body className="bg-gradient-to-br from-slate-50 via-slate-50 to-brand-light text-slate-900 min-h-screen" style={{fontFamily:'Inter, system-ui, Arial'}}>
        <header className="sticky top-0 z-20 bg-white/70 backdrop-blur border-b">
          <nav className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo.svg" width="180" height="40" alt="Switchgear Labels" className="h-10 w-auto" />
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/designer" className="btn btn-ghost">Designer</Link>
              <Link href="/checkout" className="btn btn-outline">Checkout</Link>
              <Link href="/admin" className="btn btn-outline">Admin</Link>
            </div>
          </nav>
        </header>
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">{children}</main>
        <footer className="max-w-7xl mx-auto px-4 md:px-6 py-10 text-sm text-slate-500">© {new Date().getFullYear()} Switchgear Labels</footer>
      </body>
    </html>
  )
}
