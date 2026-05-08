import { Navigate, useParams } from 'react-router-dom'
import { EventIcon, PageTrail, Pitch, PlayerInlineLink, TeamInlineLink, Widget } from '../components/ui'
import { getMatchById, getPlayerById, getTeamById } from '../data/repository'

export function MatchDetailPage() {
  const { matchId } = useParams()
  const match = getMatchById(matchId)

  if (!match) {
    return <Navigate to="/matches" replace />
  }

  const homeTeam = getTeamById(match.homeTeamId)
  const awayTeam = getTeamById(match.awayTeamId)
  const mvp = getPlayerById(match.mvpId)

  return (
    <div className="page-stack">
      <PageTrail items={[{ label: 'Home', to: '/' }, { label: 'Matches', to: '/matches' }, { label: `${homeTeam?.shortName} vs ${awayTeam?.shortName}` }]} />

      <section className="match-hero card match-hero-expanded">
        <div className="match-hero-meta-line">
          <span>{match.date}</span>
          <span>{match.time}</span>
        </div>

        <div className="match-hero-grid">
          <div className="hero-side hero-side-left">
            <div className="hero-team-block">
              <TeamInlineLink teamId={homeTeam.id} />
            </div>
            <EventStack title="" entries={match.homeEventStack} />
          </div>

          <div className="match-hero-center match-hero-center-expanded">
            <span className="eyebrow">{match.competition}</span>
            <div className="match-mvp-link">
              <span>Player of the Match</span>
              <PlayerInlineLink playerId={mvp?.id} compact />
            </div>
            <h1>{match.homeScore} : {match.awayScore}</h1>
            <small className="format-pill-large">{match.format}</small>
          </div>

          <div className="hero-side hero-side-right">
            <div className="hero-team-block hero-team-block-right">
              <TeamInlineLink teamId={awayTeam.id} />
            </div>
            <EventStack title="" entries={match.awayEventStack} />
          </div>
        </div>
      </section>

      <section className="dashboard-grid match-detail-layout">
        <Widget title="Lineups" className="span-two lineups-main-widget">
          <div className="lineups-grid">
            <div>
              <div className="lineup-header">
                <TeamInlineLink teamId={homeTeam.id} />
              </div>
              <Pitch mode="match" format={match.format} lineups={match.lineups.home} tooltips={match.lineupTooltips} />
            </div>
            <div>
              <div className="lineup-header">
                <TeamInlineLink teamId={awayTeam.id} />
              </div>
              <Pitch mode="match" format={match.format} lineups={match.lineups.away} tooltips={match.lineupTooltips} />
            </div>
          </div>
        </Widget>

        <div className="match-detail-rail">
          <Widget title="Player of the Match" className="match-detail-sidecard">
            <div className="mvp-panel">
              <PlayerInlineLink playerId={mvp?.id} />
              <div className="mvp-summary-grid">
                {match.mvpSummary.map((item) => (
                  <div key={item.label}>
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Widget>

          <Widget title="Game Highlights" className="match-detail-sidecard">
            <div className="highlights-list">
              {match.gameHighlights.map((item) => (
                <div key={`${item.minute}-${item.text}`} className="highlight-row">
                  <strong>{item.minute}&apos;</strong>
                  <EventIcon type={item.type} />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </Widget>
        </div>

        <Widget title="Shot Map and Zones" className="span-full">
          <div className="shot-zones-grid">
            {match.shotZones.map((zone) => (
              <div key={zone.zone} className="shot-zone-card">
                <span>{zone.zone}</span>
                <div className="shot-zone-score">
                  <strong>{zone.home}</strong>
                  <small>vs</small>
                  <strong>{zone.away}</strong>
                </div>
              </div>
            ))}
          </div>
        </Widget>

        <Widget title="Match Stats Comparison" className="span-full comparison-widget-standalone">
          <div className="comparison-grid">
            {match.comparisonStats.map(([label, homeValue, awayValue]) => (
              <div key={label} className="comparison-row comparison-row-standalone">
                <strong>{homeValue}</strong>
                <span>{label}</span>
                <strong>{awayValue}</strong>
              </div>
            ))}
          </div>
        </Widget>
      </section>
    </div>
  )
}

function EventStack({ entries }) {
  return (
    <div className="event-stack">
      {entries.map((entry) => (
        <div key={`${entry.playerName}-${entry.events[0]?.minute}`} className="event-stack-row">
          <div className="event-stack-player">
            <strong>{entry.playerName}</strong>
          </div>
          <div className="event-stack-events">
            {entry.events.map((event) => (
              <span key={`${entry.playerName}-${event.minute}-${event.type}`} className="event-stack-badge">
                <EventIcon type={event.type} />
                <small>{event.minute}&apos;</small>
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
