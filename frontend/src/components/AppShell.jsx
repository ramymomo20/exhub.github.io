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
  const socialLinks = [
    { href: '/', label: 'About', icon: 'A', internal: true },
    { href: '/discord', label: 'Discord', icon: 'D', internal: true },
    { href: 'https://github.com/ramymomo20/exhub.github-io', label: 'GitHub', icon: 'GH' },
    { href: 'https://store.steampowered.com/app/673560/IOSoccer/', label: 'Steam', icon: 'ST' },
  ]

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

      <footer className="site-footer">
        <div className="footer-brand">
          <strong>IOSoccer Central America</strong>
          <p>All rights reserved.</p>
        </div>
        <div className="footer-nav">
          {socialLinks.map((link) => (
            link.internal ? (
              <NavLink key={link.label} className="footer-link footer-link-icon" to={link.href}>
                <span className="footer-link-mark">{link.icon}</span>
                <span>{link.label}</span>
              </NavLink>
            ) : (
              <a key={link.label} className="footer-link footer-link-icon" href={link.href} target="_blank" rel="noreferrer">
                <span className="footer-link-mark">{link.icon}</span>
                <span>{link.label}</span>
              </a>
            )
          ))}
        </div>
      </footer>
    </div>
  )
}
