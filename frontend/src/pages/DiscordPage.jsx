import { PageIntro, PageTrail, Widget } from '../components/ui'
import { getDiscordOverview } from '../data/repository'

export function DiscordPage() {
  const discord = getDiscordOverview()
  const inviteUrl = 'https://discord.gg/HxAJHK9qW9'

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Discord Hub"
        title="Community, scheduling, and league traffic."
        description={discord.inviteLabel}
        aside={<PageTrail items={[{ label: 'Home', to: '/' }, { label: 'Discord' }]} />}
      />

      <section className="quick-stats-grid">
        {discord.stats.map((stat) => (
          <article key={stat.label} className="card quick-stat">
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <Widget title="Core Channels" className="span-two">
          <div className="timeline">
            {discord.channels.map((channel) => (
              <div key={channel} className="timeline-item">{channel}</div>
            ))}
          </div>
        </Widget>

        <Widget title="Server Snapshot">
          <ul className="note-list">
            <li>Announcements drive tournament scheduling and roster updates.</li>
            <li>Matchday channels support live coordination and dispute resolution.</li>
            <li>Highlights and clips feed the media page and future archives.</li>
          </ul>
          <div className="widget-cta-row">
            <a className="accent-link" href={inviteUrl} target="_blank" rel="noreferrer">Open invite</a>
          </div>
        </Widget>
      </section>
    </div>
  )
}
