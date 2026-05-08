import { Link, Navigate, useParams } from 'react-router-dom'
import { Crest, FormPills, PageTrail, PlayerBadge, PlayerInlineLink, StatChip, Widget } from '../components/ui'
import { getPlayerById, getTeamById, listMatchesByTeamId, listPlayersByTeamId, listTournaments } from '../data/repository'
import { getRatingToneClass } from '../utils/rating'

export function TeamProfilePage() {
  const { teamId } = useParams()
  const team = getTeamById(teamId)

  if (!team) {
    return <Navigate to="/teams" replace />
  }

  const squad = listPlayersByTeamId(team.id)
  const recent = listMatchesByTeamId(team.id).slice(0, 5)
  const latestTournament = listTournaments().find((tournament) => tournament.id === 'iosca-premier-season')
  const aggregated = buildTeamStatistics(squad)
  const captain = getPlayerById(squad.find((player) => player.name === team.captain)?.id ?? '')

  return (
    <div className="page-stack">
      <PageTrail items={[{ label: 'Home', to: '/' }, { label: 'Teams', to: '/teams' }, { label: team.name }]} />

      <section className="team-hero card team-hero-reworked">
        <div className="team-hero-crest team-hero-crest-large">
          <span className="eyebrow team-hero-eyebrow">Team Profile</span>
          <span className={`profile-big-badge team-profile-rating-badge ${getRatingToneClass(team.avgRating)}`}>{team.avgRating.toFixed(1)}</span>
          <Crest teamId={team.id} large />
        </div>
        <div className="team-hero-copy">
          <div className="team-profile-title-row">
            <h1>{team.name}</h1>
          </div>
          <div className="team-profile-meta-row">
            <span className="captain-label">CAPTAIN:</span>
            {captain ? <PlayerInlineLink playerId={captain.id} compact /> : <span className="captain-highlight">{team.captain}</span>}
            <FormPills values={team.form} />
          </div>
          <div className="profile-badges">
            <span className="tag">Created {team.createdOn}</span>
            <span className="tag">{team.competition}</span>
          </div>
        </div>
        <div className="profile-summary">
          <StatChip label="Appearances" value={team.appearances} tone="neutral" />
          <StatChip label="Players" value={team.playerCount} tone="info" />
          <StatChip label="Win Rate" value={`${Math.round((team.wins / team.appearances) * 100)}%`} tone="success" />
          <StatChip label="Rank" value={`#${team.rank}`} tone="positive" />
        </div>
      </section>

      <section className="dashboard-grid">
        <Widget title="Squad Preview" className="span-two">
          <div className="horizontal-rail">
            {squad.map((player) => (
              <PlayerBadge key={player.id} player={player} compact />
            ))}
          </div>
        </Widget>

        <Widget title="Aggregated Team Statistics" className="span-full">
          <div className="stats-section-grid">
            <TeamStatSection title="General" items={[
              ['Appearances', team.appearances],
              ['Wins', team.wins],
              ['Draws', team.draws],
              ['Losses', team.losses],
              ['Average rating', team.avgRating.toFixed(1)],
              ['Players', team.playerCount],
            ]} />
            <TeamStatSection title="Teamplay" items={[
              ['Assists', aggregated.assists],
              ['APasses', aggregated.apasses],
              ['Passes completed', aggregated.passesCompleted],
              ['Pass accuracy', `${aggregated.passAccuracy}%`],
              ['Key passes', aggregated.keyPasses],
              ['Chances created', aggregated.chancesCreated],
              ['Second assists', aggregated.secondAssists],
            ]} />
            <TeamStatSection title="Discipline" items={[
              ['Fouls', aggregated.fouls],
              ['Fouls suffered', aggregated.foulsSuffered],
              ['Yellow cards', aggregated.yellowCards],
              ['Red cards', aggregated.redCards],
              ['Offsides', aggregated.offsides],
            ]} />
            <TeamStatSection title="Goalkeeping" items={[
              ['Saves', aggregated.saves],
              ['Saves caught', aggregated.savesCaught],
              ['Save percentage', `${aggregated.savePercentage}%`],
              ['Goals conceded', aggregated.goalsConceded],
              ['Own goals', aggregated.ownGoals],
            ]} />
            <TeamStatSection title="Defending" items={[
              ['Interceptions', aggregated.interceptions],
              ['Tackles', aggregated.tackles],
              ['Tackles completed', aggregated.tacklesCompleted],
              ['Tackle accuracy', `${aggregated.tackleAccuracy}%`],
              ['Average distance ran', `${aggregated.distanceRan} km`],
            ]} />
            <TeamStatSection title="Attacking" items={[
              ['Goals', aggregated.goals],
              ['Shots', aggregated.shots],
              ['Shots on target', aggregated.shotsOnTarget],
              ['Shot accuracy', `${aggregated.shotAccuracy}%`],
              ['Goals per game', aggregated.goalsPerGame],
            ]} />
          </div>
        </Widget>

        <Widget title="Current Tournament">
          <div className="tournament-summary-card">
            <strong>{latestTournament?.name}</strong>
            <p>Current place #{team.rank}</p>
            <small>{team.wins} wins | {team.draws} draws | {team.losses} losses</small>
          </div>
        </Widget>

        <Widget title="Recent Matches" className="span-two">
          <div className="results-stack">
            {recent.map((match) => (
              <Link key={match.id} className="log-card log-card-link" to={`/matches/${match.id}`}>
                <div>
                  <strong>{match.competition}</strong>
                  <p>{match.date} | {match.time}</p>
                </div>
                <div className="log-card-score">{match.homeScore} : {match.awayScore}</div>
                <div>
                  <strong>MVP</strong>
                  {getPlayerById(match.mvpId) ? <PlayerInlineLink playerId={match.mvpId} compact /> : <p>{match.mvpId}</p>}
                </div>
              </Link>
            ))}
          </div>
        </Widget>

        <Widget title="Tournament History">
          <div className="timeline">
            <div className="timeline-item">
              <strong>IOSCA Champions Cup</strong>
              <p>Reached semi finals</p>
              <small>Knockout record 3W 1L</small>
            </div>
            <div className="timeline-item">
              <strong>Founder&apos;s Shield</strong>
              <p>Runners up</p>
              <small>Finished with the silver medal.</small>
            </div>
          </div>
        </Widget>
      </section>
    </div>
  )
}

function buildTeamStatistics(squad) {
  const totals = squad.reduce((accumulator, player) => {
    Object.entries(player.stats).forEach(([key, value]) => {
      if (typeof value === 'number') {
        accumulator[key] = (accumulator[key] ?? 0) + value
      }
    })

    return accumulator
  }, {})

  const playersCount = squad.length || 1
  const appearances = totals.appearances || 1

  return {
    assists: totals.assists ?? 0,
    apasses: totals.apasses ?? 0,
    passesCompleted: totals.passesCompleted ?? 0,
    passAccuracy: Math.round((totals.passAccuracy ?? 0) / playersCount),
    keyPasses: totals.keyPasses ?? 0,
    chancesCreated: totals.chancesCreated ?? 0,
    secondAssists: totals.secondAssists ?? 0,
    fouls: totals.fouls ?? 0,
    foulsSuffered: totals.foulsSuffered ?? 0,
    yellowCards: totals.yellowCards ?? 0,
    redCards: totals.redCards ?? 0,
    offsides: totals.offsides ?? 0,
    saves: totals.saves ?? 0,
    savesCaught: totals.savesCaught ?? 0,
    savePercentage: Math.round((totals.savePercentage ?? 0) / playersCount),
    goalsConceded: totals.goalsConceded ?? 0,
    ownGoals: totals.ownGoals ?? 0,
    interceptions: totals.interceptions ?? 0,
    tackles: totals.tackles ?? 0,
    tacklesCompleted: totals.tacklesCompleted ?? 0,
    tackleAccuracy: Math.round((totals.tackleAccuracy ?? 0) / playersCount),
    distanceRan: ((totals.distanceRan ?? 0) / playersCount).toFixed(1),
    goals: totals.goals ?? 0,
    shots: totals.shots ?? 0,
    shotsOnTarget: totals.shotsOnTarget ?? 0,
    shotAccuracy: Math.round((totals.shotAccuracy ?? 0) / playersCount),
    goalsPerGame: ((totals.goals ?? 0) / appearances).toFixed(2),
  }
}

function TeamStatSection({ title, items }) {
  return (
    <div className="stats-section-card">
      <h3>{title}</h3>
      <div className="stats-pair-list">
        {items.map(([label, value]) => (
          <div key={label} className="stats-pair-row">
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}
