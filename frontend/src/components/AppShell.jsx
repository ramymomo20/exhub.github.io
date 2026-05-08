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
  { to: '/discord', label: 'Discord' },
]

export function AppShell() {
  const brandIcon = `${import.meta.env.BASE_URL}icons/iosca-icon.png`

  return (
    <div className="site-shell">
      <div className="site-glow site-glow-left" />
      <div className="site-glow site-glow-right" />

      <header className="topbar">
        <NavLink className="brand" to="/">
          <span className="brand-mark brand-mark-image">
            <img src={brandIcon} alt="IOSCA Hub" />
          </span>
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
    </div>
  )
}
