import { useEffect, useState } from 'react'
import { AccentLink, MatchCard, Pitch, PlayerBadge, PlayerInlineLink, Widget } from '../components/ui'
import { getTopRatedPlayers, listHomeFeatures, listMatches, listPlayers, listQuickStats, listTeamOfWeek } from '../data/repository'

export function HomePage() {
  const homeFeatures = listHomeFeatures()
  const quickStats = listQuickStats()
  const players = listPlayers()
  const matches = listMatches()
  const teamOfWeek = listTeamOfWeek()
  const topThree = getTopRatedPlayers(3)
  const featureCount = homeFeatures.length
  const [featureIndex, setFeatureIndex] = useState(0)
  const activeFeature = homeFeatures[featureIndex]

  useEffect(() => {
    const handle = window.setInterval(() => {
      setFeatureIndex((current) => (current + 1) % featureCount)
    }, 5000)

    return () => window.clearInterval(handle)
  }, [featureCount])

  return (
    <div className="page-stack">
      <section className={`hero hero-${activeFeature.accent}`}>
        <div className="hero-copy">
          <span className="eyebrow">IOSCA Hub</span>
          <h1>{activeFeature.title}</h1>
          <p className="lede">{activeFeature.description}</p>
          <div className="hero-actions">
            <AccentLink to={activeFeature.action} label="Open feature" />
          </div>
        </div>

        <div className="hero-meta card">
          <span className="feature-tag">{activeFeature.label}</span>
          <div className="hero-pager">
            {homeFeatures.map((feature, index) => (
              <button
                key={feature.title}
                className={`hero-dot${index === featureIndex ? ' is-active' : ''}`}
                type="button"
                onClick={() => setFeatureIndex(index)}
                aria-label={feature.title}
              />
            ))}
          </div>
          <div className="broadcast-lines">
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>

      <section className="quick-stats-grid">
        {quickStats.map((stat) => (
          <article key={stat.label} className="card quick-stat">
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <small>{stat.delta}</small>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <Widget title="Trending Players" className="span-two">
          <div className="horizontal-rail">
            {players.slice(0, 6).map((player) => (
              <PlayerBadge key={player.id} player={player} />
            ))}
          </div>
        </Widget>

        <Widget title="Top 3 Rated Players">
          <div className="top-three-list">
            {topThree.map((player, index) => (
              <div key={player.id} className={`top-three-item place-${index + 1}`}>
                <div className="top-three-left">
                  <span className="top-three-rank">{index + 1}.</span>
                  <PlayerInlineLink playerId={player.id} />
                </div>
                <strong>{player.position}</strong>
              </div>
            ))}
          </div>
        </Widget>

        <Widget title="Latest Results Feed" className="span-two">
          <div className="results-stack">
            {matches.slice(0, 3).map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </Widget>

        <Widget title="Team of the Week" className="span-two">
          <Pitch playersOnPitch={teamOfWeek} />
        </Widget>
      </section>
    </div>
  )
}
