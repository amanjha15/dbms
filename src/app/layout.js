import './globals.css'

export const metadata = {
  title: 'Placement Tracker 2025-26',
  description: 'Public Placement Tracking Dashboard.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <div className="bg-gradient-orange"></div>
        <div className="bg-gradient-pink"></div>
        <nav>
          <a href="/" className="nav-brand">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}>
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            PLACEMENT/TRACKER
          </a>
          <div className="nav-links">
            <a href="/admin" className="btn btn-primary">+ Admin Access</a>
          </div>
        </nav>
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}
