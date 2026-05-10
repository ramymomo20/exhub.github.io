import { useMemo, useState } from 'react'
import { PageIntro, PageTrail, Widget } from '../components/ui'
import { listMedia } from '../data/repository'

export function MediaPage() {
  const media = listMedia()
  const [typeFilter, setTypeFilter] = useState('all')
  const [lengthFilter, setLengthFilter] = useState('all')
  const [activeItem, setActiveItem] = useState(null)
  const downloadIcon = `${import.meta.env.BASE_URL}icons/download-icon.png`
  const imageIcon = `${import.meta.env.BASE_URL}icons/image-icon.png`
  const videoIcon = `${import.meta.env.BASE_URL}icons/video-icon.png`
  const filtered = useMemo(() => media.filter((item) => (
    (typeFilter === 'all' || item.group === typeFilter) &&
    (lengthFilter === 'all' || item.lengthBucket === lengthFilter)
  )), [media, typeFilter, lengthFilter])

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Media"
        title="Community moments, highlights, and prestige clips."
        description="A dedicated visual layer for the league so the site feels alive even before data integrations deepen."
        aside={<PageTrail items={[{ label: 'Home', to: '/' }, { label: 'Media' }]} />}
      />

      <Widget title="Media Directory" className="span-full">
        <div className="filter-bar media-filter-bar">
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            <option value="all">All types</option>
            <option value="goal-clips">Goal clips</option>
            <option value="highlights">Highlights</option>
            <option value="screenshots">Screenshots</option>
            <option value="compilations">Compilations</option>
          </select>
          <select value={lengthFilter} onChange={(event) => setLengthFilter(event.target.value)}>
            <option value="all">All lengths</option>
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="long">Long</option>
          </select>
        </div>

        <section className="media-grid">
          {filtered.map((item) => (
            <article key={item.id} className={`card media-card accent-${item.accent}`}>
              <button type="button" className="media-thumb media-thumb-rich" onClick={() => setActiveItem(item)}>
                <span className="media-thumb-icon">
                  <img src={item.group === 'screenshots' ? imageIcon : videoIcon} alt="" />
                </span>
                <span className="media-thumb-type">{item.type}</span>
                <span className="media-thumb-title">{item.title}</span>
              </button>
              <div className="media-body">
                <h3>{item.title}</h3>
                <p>{item.length}</p>
                <small className="media-uploader">Uploaded by {item.uploader}</small>
                <div className="media-actions">
                  <button type="button" className="ghost-button" onClick={() => setActiveItem(item)}>Open</button>
                  <a className="ghost-button" href={item.assetUrl} target="_blank" rel="noreferrer">New tab</a>
                  <a className="ghost-button ghost-button-icon" href={item.assetUrl} download>
                    <img src={downloadIcon} alt="" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </section>
      </Widget>

      {activeItem ? (
        <div className="media-viewer-overlay" role="dialog" aria-modal="true">
          <div className="card media-viewer-card">
            <div className="media-viewer-head">
              <strong>{activeItem.title}</strong>
              <button type="button" className="ghost-button" onClick={() => setActiveItem(null)}>Close</button>
            </div>
            <div className="media-viewer-frame">
              {activeItem.group === 'screenshots' || activeItem.assetUrl === '#' ? (
                <div className={`media-thumb media-viewer-thumb accent-${activeItem.accent}`}>{activeItem.type}</div>
              ) : (
                <video controls preload="metadata" poster="" className="media-viewer-video">
                  <source src={activeItem.assetUrl} />
                </video>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <Widget title="Hall of Fame Moments">
        <ul className="note-list">
          <li>Champions Cup final winner from the half-space.</li>
          <li>Perfect defensive block in Northport&apos;s title-clinching draw.</li>
          <li>Atlas Borough&apos;s giant-killing cup upset.</li>
        </ul>
      </Widget>
    </div>
  )
}
