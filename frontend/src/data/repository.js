import {
  discordOverview,
  homeFeatures,
  matches,
  media,
  players,
  positionOptions,
  quickStats,
  records,
  teamOfWeek,
  teams,
  tournaments,
} from './mockData'

const teamIndex = new Map(teams.map((team) => [team.id, team]))
const playerIndex = new Map(players.map((player) => [player.id, player]))
const matchIndex = new Map(matches.map((match) => [match.id, match]))
const tournamentIndex = new Map(tournaments.map((tournament) => [tournament.id, tournament]))

export const listTeams = () => teams
export const getTeamById = (teamId) => teamIndex.get(teamId) ?? null
export const getTeamName = (teamId) => getTeamById(teamId)?.name ?? teamId
export const listPlayers = () => players
export const getPlayerById = (playerId) => playerIndex.get(playerId) ?? null
export const listPlayersByTeamId = (teamId) => players.filter((player) => player.teamId === teamId)
export const listMatches = () => matches
export const getMatchById = (matchId) => matchIndex.get(matchId) ?? null
export const listMatchesByTeamId = (teamId) => matches.filter((match) => match.homeTeamId === teamId || match.awayTeamId === teamId)
export const listPlayerMatchLogs = (playerId) => matches.filter((match) => match.performances.some((entry) => entry.playerId === playerId))
export const listPlayersByIds = (playerIds) => playerIds.map((playerId) => getPlayerById(playerId)).filter(Boolean)
export const listTournaments = () => tournaments
export const getTournamentById = (tournamentId) => tournamentIndex.get(tournamentId) ?? null
export const listRecords = () => records
export const listMedia = () => media
export const listHomeFeatures = () => homeFeatures
export const listQuickStats = () => quickStats
export const listTeamOfWeek = () => teamOfWeek
export const listPositionOptions = () => positionOptions
export const getDiscordOverview = () => discordOverview

export function getTopRatedPlayers(limit = 3) {
  return [...players].sort((left, right) => right.rating - left.rating).slice(0, limit)
}

export function getPlayerPerformance(matchId, playerId) {
  const match = getMatchById(matchId)
  return match?.performances.find((entry) => entry.playerId === playerId) ?? null
}

export function getTournamentFixtures(tournamentId) {
  const tournament = getTournamentById(tournamentId)
  if (!tournament) return []
  return tournament.fixtures.map((matchId) => getMatchById(matchId)).filter(Boolean)
}
