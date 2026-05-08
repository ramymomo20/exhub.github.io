import { PageIntro, PageTrail, Widget } from '../components/ui'
import { listMedia } from '../data/repository'

export function MediaPage() {
  const media = listMedia()
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Media"
        title="Community moments, highlights, and prestige clips."
        description="A dedicated visual layer for the league so the site feels alive even before data integrations deepen."
        aside={<PageTrail items={[{ label: 'Home', to: '/' }, { label: 'Media' }]} />}
      />

      <section className="media-grid">
        {media.map((item) => (
          <article key={item.id} className={`card media-card accent-${item.accent}`}>
            <div className="media-thumb">{item.type}</div>
            <div className="media-body">
              <h3>{item.title}</h3>
              <p>{item.length}</p>
            </div>
          </article>
        ))}
      </section>

      <Widget title="Hall of Fame Moments">
        <ul className="note-list">
          <li>Champions Cup final winner from the half-space.</li>
          <li>Perfect defensive block in Northport's title-clinching draw.</li>
          <li>Atlas Borough's giant-killing cup upset.</li>
        </ul>
      </Widget>
    </div>
  )
}
