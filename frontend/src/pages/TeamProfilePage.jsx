import { Link, Navigate, useParams } from 'react-router-dom'
import { Crest, FormPills, PageTrail, PlayerBadge, PlayerInlineLink, StatChip, Widget } from '../components/ui'
import { getPlayerById, getTeamById, listMatchesByTeamId, listPlayersByTeamId, useHubTeamDetail } from '../data/repository'
import { getRatingToneClass } from '../utils/rating'

export function TeamProfilePage() {
  const { teamId } = useParams()
  const { loading } = useHubTeamDetail(teamId)
  const team = getTeamById(teamId)

  if (!team && loading) {
    return null
  }

  if (!team) {
    return <Navigate to="/teams" replace />
  }

  const squad = listPlayersByTeamId(team.id)
  const recent = (team.recentMatches?.length ? team.recentMatches : listMatchesByTeamId(team.id)).slice(0, 5)
  const aggregated = team.aggregateStats ?? buildTeamStatistics(squad)
  const captain = getPlayerById(squad.find((player) => player.name === team.captain)?.id ?? '')
  const groupedSquad = groupSquadByUnit(squad)
  const recentCompetitions = Array.from(new Set(recent.map((match) => match.competition).filter(Boolean)))
  const currentCompetition = recent[0]?.competition ?? team.competition

  return (
    <div className="page-stack">
      <PageTrail items={[{ label: 'Home', to: '/' }, { label: 'Teams', to: '/teams' }, { label: team.name }]} />

      <section className="team-hero card team-hero-reworked">
        <div className={`team-hero-crest team-hero-crest-large team-hero-crest-rated ${getRatingToneClass(team.avgRating)}`}>
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
          <StatChip label="Win Rate" value={`${team.appearances > 0 ? Math.round((team.wins / team.appearances) * 100) : 0}%`} tone="success" />
          <StatChip label="Rank" value={`#${team.rank}`} tone="positive" />
        </div>
      </section>

      <section className="dashboard-grid">
        <Widget title="Squad Preview" className="span-two">
          <div className="squad-preview-groups">
            {Object.entries(groupedSquad).map(([label, players]) => (
              <div key={label} className="squad-preview-group">
                <strong>{label}</strong>
                <div className="horizontal-rail horizontal-rail-tight">
                  {players.map((player) => (
                    <PlayerBadge key={player.id} player={player} compact />
                  ))}
                </div>
              </div>
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
              ['Passes', aggregated.apasses],
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
              ['Total distance ran', `${aggregated.totalDistanceRan} km`],
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
            <strong>{currentCompetition}</strong>
            <p>Current rank #{team.rank}</p>
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
                  {match.mvpId && getPlayerById(match.mvpId)
                    ? <PlayerInlineLink playerId={match.mvpId} compact />
                    : <p>{match.mvpName || match.mvpId || 'N/A'}</p>}
                </div>
              </Link>
            ))}
          </div>
        </Widget>

        <Widget title="Tournament History">
          {recentCompetitions.length ? (
            <div className="timeline">
              {recentCompetitions.map((competition) => (
                <div key={competition} className="timeline-item">
                  <strong>{competition}</strong>
                  <p>{team.wins} wins | {team.draws} draws | {team.losses} losses</p>
                  <small>{team.goalsFor} goals scored | {team.goalsAgainst} conceded</small>
                </div>
              ))}
            </div>
          ) : (
            <p>No synced tournament history for this team yet.</p>
          )}
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

  const appearances = totals.appearances || 1
  const passesAttempted = totals.apasses ?? 0
  const savesFaced = (totals.saves ?? 0) + (totals.goalsConceded ?? 0)
  const tackles = totals.tackles ?? 0
  const shots = totals.shots ?? 0
  const totalDistanceRan = totals.totalDistanceRan ?? 0

  return {
    assists: totals.assists ?? 0,
    apasses: passesAttempted,
    passesCompleted: totals.passesCompleted ?? 0,
    passAccuracy: passesAttempted > 0 ? Math.round(((totals.passesCompleted ?? 0) / passesAttempted) * 100) : 0,
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
    savePercentage: savesFaced > 0 ? Math.round(((totals.saves ?? 0) / savesFaced) * 100) : 0,
    goalsConceded: totals.goalsConceded ?? 0,
    ownGoals: totals.ownGoals ?? 0,
    interceptions: totals.interceptions ?? 0,
    tackles: totals.tackles ?? 0,
    tacklesCompleted: totals.tacklesCompleted ?? 0,
    tackleAccuracy: tackles > 0 ? Math.round(((totals.tacklesCompleted ?? 0) / tackles) * 100) : 0,
    distanceRan: (totalDistanceRan / appearances).toFixed(1),
    totalDistanceRan: totalDistanceRan.toFixed(1),
    goals: totals.goals ?? 0,
    shots: totals.shots ?? 0,
    shotsOnTarget: totals.shotsOnTarget ?? 0,
    shotAccuracy: shots > 0 ? Math.round(((totals.shotsOnTarget ?? 0) / shots) * 100) : 0,
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

function groupSquadByUnit(squad) {
  const groups = {
    GK: [],
    DEF: [],
    MID: [],
    ATK: [],
  }

  squad
    .slice()
    .sort((left, right) => right.rating - left.rating)
    .forEach((player) => {
      if (player.position === 'GK') groups.GK.push(player)
      else if (['LB', 'CB', 'RB'].includes(player.position)) groups.DEF.push(player)
      else if (['CM', 'LM', 'RM'].includes(player.position)) groups.MID.push(player)
      else groups.ATK.push(player)
    })

  return groups
}
