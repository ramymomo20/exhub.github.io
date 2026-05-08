import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/players', label: 'Players' },
  { to: '/teams', label: 'Teams' },
  { to: '/matches', label: 'Matches' },
  { to: '/rankings', label: 'Rankings' },
  { to: '/tournaments', label: 'Tournaments' },
  { to: '/records', label: 'Records' },
  { to: '/media', label: 'Media' },
]

export function AppShell() {
  return (
    <div className="site-shell">
      <div className="site-glow site-glow-left" />
      <div className="site-glow site-glow-right" />

      <header className="topbar">
        <NavLink className="brand" to="/">
          <span className="brand-mark">IH</span>
          <span>
            <strong>IOSCA Hub</strong>
            <small>Neo Football Intelligence</small>
          </span>
        </NavLink>

        <nav className="main-nav" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
          <a className="nav-link nav-link-discord" href="https://discord.com" target="_blank" rel="noreferrer">
            Discord
          </a>
        </nav>

        <div className="topbar-tools">
          <button className="tool-chip" type="button">Search</button>
          <button className="tool-chip" type="button">Alerts</button>
          <button className="profile-chip" type="button" aria-label="Profile">IO</button>
        </div>
      </header>

      <main className="page-wrap">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <strong>IOSCA Hub</strong>
          <p>Static-first frontend templates now, structured data adapters ready for database-backed content later.</p>
        </div>
        <nav className="footer-nav" aria-label="Footer">
          {navItems.map((item) => (
            <NavLink key={item.label} to={item.to} end={item.end} className="footer-link">
              {item.label}
            </NavLink>
          ))}
        </nav>
      </footer>
    </div>
  )
}
