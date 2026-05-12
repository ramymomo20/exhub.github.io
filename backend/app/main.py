from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware

from . import config
from .db import create_mysql_pool, mysql_cursor, public_row, public_rows


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.mysql_pool = await create_mysql_pool()
    try:
        yield
    finally:
        app.state.mysql_pool.close()
        await app.state.mysql_pool.wait_closed()


app = FastAPI(title=config.API_TITLE, version=config.API_VERSION, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["*"],
)


PLAYER_STATS_SUBQUERY = """
    SELECT
        pmd.steam_id,
        SUM(pmd.goals) AS goals,
        SUM(pmd.assists) AS assists,
        SUM(pmd.second_assists) AS second_assists,
        SUM(pmd.shots) AS shots,
        SUM(pmd.shots_on_goal) AS shots_on_goal,
        SUM(pmd.passes_completed) AS passes_completed,
        SUM(pmd.passes_attempted) AS passes_attempted,
        CASE
            WHEN SUM(pmd.passes_attempted) > 0
                THEN ROUND((SUM(pmd.passes_completed) / SUM(pmd.passes_attempted)) * 100, 2)
            ELSE 0
        END AS pass_accuracy,
        SUM(pmd.chances_created) AS chances_created,
        SUM(pmd.key_passes) AS key_passes,
        SUM(pmd.interceptions) AS interceptions,
        SUM(pmd.tackles) AS tackles,
        SUM(pmd.sliding_tackles_completed) AS sliding_tackles_completed,
        SUM(pmd.fouls) AS fouls,
        SUM(pmd.fouls_suffered) AS fouls_suffered,
        SUM(pmd.yellow_cards) AS yellow_cards,
        SUM(pmd.red_cards) AS red_cards,
        SUM(pmd.own_goals) AS own_goals,
        SUM(pmd.keeper_saves) AS keeper_saves,
        SUM(pmd.keeper_saves_caught) AS keeper_saves_caught,
        SUM(pmd.goals_conceded) AS goals_conceded,
        SUM(pmd.free_kicks) AS free_kicks,
        SUM(pmd.penalties) AS penalties,
        SUM(pmd.corners) AS corners,
        SUM(pmd.throw_ins) AS throw_ins,
        SUM(pmd.goal_kicks) AS goal_kicks,
        SUM(pmd.offsides) AS offsides,
        AVG(pmd.possession) AS possession,
        SUM(pmd.time_played) AS time_played,
        SUM(pmd.distance_covered) AS distance_covered,
        AVG(pmd.match_rating) AS avg_match_rating,
        SUM(CASE WHEN pmd.is_match_mvp THEN 1 ELSE 0 END) AS mvp_awards,
        SUM(
            CASE
                WHEN (pmd.team_side = 'home' AND m.home_score > m.away_score)
                  OR (pmd.team_side = 'away' AND m.away_score > m.home_score)
                    THEN 1
                ELSE 0
            END
        ) AS wins,
        SUM(CASE WHEN m.home_score = m.away_score THEN 1 ELSE 0 END) AS draws,
        SUM(
            CASE
                WHEN (pmd.team_side = 'home' AND m.home_score < m.away_score)
                  OR (pmd.team_side = 'away' AND m.away_score < m.home_score)
                    THEN 1
                ELSE 0
            END
        ) AS losses
    FROM hub_match_player_stats pmd
    LEFT JOIN hub_matches m ON m.match_stats_id = pmd.match_stats_id
    GROUP BY pmd.steam_id
"""

CURRENT_PLAYER_TEAM_SUBQUERY = """
    SELECT
        latest.steam_id,
        latest.resolved_team_guild_id AS team_guild_id,
        latest.resolved_team_name AS guild_team_name
    FROM (
        SELECT
            pmd.steam_id,
            COALESCE(
                NULLIF(pmd.team_guild_id, ''),
                CASE
                    WHEN pmd.team_side = 'home' THEN m.home_guild_id
                    WHEN pmd.team_side = 'away' THEN m.away_guild_id
                    ELSE NULL
                END
            ) AS resolved_team_guild_id,
            COALESCE(
                NULLIF(pmd.guild_team_name, ''),
                CASE
                    WHEN pmd.team_side = 'home' THEN m.home_team_name
                    WHEN pmd.team_side = 'away' THEN m.away_team_name
                    ELSE NULL
                END
            ) AS resolved_team_name,
            ROW_NUMBER() OVER (
                PARTITION BY pmd.steam_id
                ORDER BY COALESCE(pmd.source_updated_at, m.source_updated_at, m.match_datetime) DESC, pmd.match_stats_id DESC
            ) AS row_num
        FROM hub_match_player_stats pmd
        LEFT JOIN hub_matches m ON m.match_stats_id = pmd.match_stats_id
        WHERE pmd.team_guild_id IS NOT NULL OR pmd.team_side IN ('home', 'away')
    ) latest
    WHERE latest.row_num = 1
"""

PLAYER_SELECT_FIELDS = """
    p.steam_id,
    p.discord_id,
    p.display_name,
    p.primary_position,
    p.rating,
    p.atk_rating,
    p.mid_rating,
    p.def_rating,
    p.gk_rating,
    p.appearances,
    p.total_minutes,
    p.last_match_at,
    p.registered_at,
    p.source_updated_at,
    p.synced_at,
    current_team.team_guild_id AS current_team_guild_id,
    current_team.guild_team_name AS current_team_name,
    COALESCE(stats.goals, 0) AS goals,
    COALESCE(stats.assists, 0) AS assists,
    COALESCE(stats.second_assists, 0) AS second_assists,
    COALESCE(stats.shots, 0) AS shots,
    COALESCE(stats.shots_on_goal, 0) AS shots_on_goal,
    COALESCE(stats.passes_completed, 0) AS passes_completed,
    COALESCE(stats.passes_attempted, 0) AS passes_attempted,
    COALESCE(stats.pass_accuracy, 0) AS pass_accuracy,
    COALESCE(stats.chances_created, 0) AS chances_created,
    COALESCE(stats.key_passes, 0) AS key_passes,
    COALESCE(stats.interceptions, 0) AS interceptions,
    COALESCE(stats.tackles, 0) AS tackles,
    COALESCE(stats.sliding_tackles_completed, 0) AS sliding_tackles_completed,
    COALESCE(stats.fouls, 0) AS fouls,
    COALESCE(stats.fouls_suffered, 0) AS fouls_suffered,
    COALESCE(stats.yellow_cards, 0) AS yellow_cards,
    COALESCE(stats.red_cards, 0) AS red_cards,
    COALESCE(stats.own_goals, 0) AS own_goals,
    COALESCE(stats.keeper_saves, 0) AS keeper_saves,
    COALESCE(stats.keeper_saves_caught, 0) AS keeper_saves_caught,
    COALESCE(stats.goals_conceded, 0) AS goals_conceded,
    COALESCE(stats.free_kicks, 0) AS free_kicks,
    COALESCE(stats.penalties, 0) AS penalties,
    COALESCE(stats.corners, 0) AS corners,
    COALESCE(stats.throw_ins, 0) AS throw_ins,
    COALESCE(stats.goal_kicks, 0) AS goal_kicks,
    COALESCE(stats.offsides, 0) AS offsides,
    COALESCE(stats.possession, 0) AS possession,
    COALESCE(stats.time_played, 0) AS time_played,
    COALESCE(stats.distance_covered, 0) AS distance_covered,
    COALESCE(stats.avg_match_rating, 0) AS avg_match_rating,
    COALESCE(stats.mvp_awards, 0) AS mvp_awards,
    COALESCE(stats.wins, 0) AS wins,
    COALESCE(stats.draws, 0) AS draws,
    COALESCE(stats.losses, 0) AS losses
"""

PLAYER_SELECT_FROM = f"""
    FROM hub_players p
    LEFT JOIN ({PLAYER_STATS_SUBQUERY}) stats ON stats.steam_id = p.steam_id
    LEFT JOIN ({CURRENT_PLAYER_TEAM_SUBQUERY}) current_team ON current_team.steam_id = p.steam_id
"""

MATCH_SELECT_FIELDS = """
    m.match_stats_id,
    m.match_id,
    m.match_datetime,
    m.home_guild_id,
    m.away_guild_id,
    m.home_team_name,
    m.home_short_name,
    m.home_crest_url,
    m.away_team_name,
    m.away_short_name,
    m.away_crest_url,
    m.home_score,
    m.away_score,
    m.game_type,
    m.extratime,
    m.penalties,
    m.comeback_flag,
    m.source_filename,
    m.mvp_steam_id,
    m.mvp_player_name,
    m.mvp_match_rating,
    m.source_updated_at,
    m.synced_at,
    fixture.tournament_id,
    tournament.name AS tournament_name,
    fixture.league_key,
    fixture.week_number
"""

MATCH_SELECT_FROM = """
    FROM v_hub_match_overview m
    LEFT JOIN hub_tournament_fixtures fixture ON fixture.played_match_stats_id = m.match_stats_id
    LEFT JOIN hub_tournaments tournament ON tournament.tournament_id = fixture.tournament_id
"""


async def fetch_all(request: Request, sql: str, params: tuple[Any, ...] = ()) -> list[dict[str, Any]]:
    try:
        async with mysql_cursor(request.app.state.mysql_pool) as (_, cur):
            await asyncio.wait_for(
                cur.execute(sql, params),
                timeout=config.MYSQL_QUERY_TIMEOUT_SECONDS,
            )
            return public_rows(
                await asyncio.wait_for(
                    cur.fetchall(),
                    timeout=config.MYSQL_QUERY_TIMEOUT_SECONDS,
                )
            )
    except asyncio.TimeoutError as exc:
        raise HTTPException(status_code=504, detail="Hub database query timed out") from exc


async def fetch_one(request: Request, sql: str, params: tuple[Any, ...]) -> dict[str, Any] | None:
    try:
        async with mysql_cursor(request.app.state.mysql_pool) as (_, cur):
            await asyncio.wait_for(
                cur.execute(sql, params),
                timeout=config.MYSQL_QUERY_TIMEOUT_SECONDS,
            )
            row = await asyncio.wait_for(
                cur.fetchone(),
                timeout=config.MYSQL_QUERY_TIMEOUT_SECONDS,
            )
            return public_row(dict(row)) if row else None
    except asyncio.TimeoutError as exc:
        raise HTTPException(status_code=504, detail="Hub database query timed out") from exc


@app.get("/health")
async def health(request: Request):
    try:
        async with mysql_cursor(request.app.state.mysql_pool) as (_, cur):
            await asyncio.wait_for(
                cur.execute("SELECT 1 AS ok"),
                timeout=config.MYSQL_QUERY_TIMEOUT_SECONDS,
            )
            row = await asyncio.wait_for(
                cur.fetchone(),
                timeout=config.MYSQL_QUERY_TIMEOUT_SECONDS,
            )
    except asyncio.TimeoutError as exc:
        raise HTTPException(status_code=504, detail="Hub database query timed out") from exc
    return {"ok": bool(row and row.get("ok") == 1)}


@app.get("/api/players")
async def list_players(
    request: Request,
    q: str = "",
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    where = ""
    params: list[Any] = []
    if q.strip():
        where = "WHERE p.display_name LIKE %s OR p.steam_id LIKE %s"
        like = f"%{q.strip()}%"
        params.extend([like, like])

    params.extend([limit, offset])
    return await fetch_all(
        request,
        f"""
        SELECT {PLAYER_SELECT_FIELDS}
        {PLAYER_SELECT_FROM}
        {where}
        ORDER BY p.rating DESC, p.display_name ASC
        LIMIT %s OFFSET %s
        """,
        tuple(params),
    )


@app.get("/api/players/{steam_id}")
async def get_player(request: Request, steam_id: str):
    player = await fetch_one(
        request,
        f"""
        SELECT {PLAYER_SELECT_FIELDS}
        {PLAYER_SELECT_FROM}
        WHERE p.steam_id = %s
        """,
        (steam_id,),
    )
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    player["recent_matches"] = await fetch_all(
        request,
        f"""
        SELECT
            pmd.*,
            overview.match_datetime,
            overview.home_guild_id,
            overview.away_guild_id,
            overview.home_team_name,
            overview.away_team_name,
            overview.home_score,
            overview.away_score,
            overview.game_type,
            overview.extratime,
            overview.penalties,
            overview.comeback_flag,
            overview.tournament_id,
            overview.tournament_name,
            overview.league_key,
            overview.week_number
        FROM hub_match_player_stats pmd
        JOIN (
            SELECT {MATCH_SELECT_FIELDS}
            {MATCH_SELECT_FROM}
        ) overview ON overview.match_stats_id = pmd.match_stats_id
        WHERE pmd.steam_id = %s
        ORDER BY overview.match_datetime DESC
        LIMIT 20
        """,
        (steam_id,),
    )
    return player


@app.get("/api/teams")
async def list_teams(request: Request, limit: int = Query(100, ge=1, le=250), offset: int = Query(0, ge=0)):
    return await fetch_all(
        request,
        """
        SELECT *
        FROM v_hub_team_profile_summary
        ORDER BY average_rating DESC, name ASC
        LIMIT %s OFFSET %s
        """,
        (limit, offset),
    )


@app.get("/api/teams/{guild_id}")
async def get_team(request: Request, guild_id: str):
    team = await fetch_one(request, "SELECT * FROM v_hub_team_profile_summary WHERE guild_id = %s", (guild_id,))
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    team["recent_matches"] = await fetch_all(
        request,
        f"""
        SELECT {MATCH_SELECT_FIELDS}
        {MATCH_SELECT_FROM}
        WHERE m.home_guild_id = %s OR m.away_guild_id = %s
        ORDER BY m.match_datetime DESC
        LIMIT 20
        """,
        (guild_id, guild_id),
    )
    team["players"] = await fetch_all(
        request,
        f"""
        SELECT {PLAYER_SELECT_FIELDS}
        {PLAYER_SELECT_FROM}
        WHERE current_team.team_guild_id = %s
        ORDER BY p.rating DESC, p.display_name ASC
        """,
        (guild_id,),
    )
    return team


@app.get("/api/matches")
async def list_matches(
    request: Request,
    team_id: str | None = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    where = ""
    params: list[Any] = []
    if team_id is not None:
        where = "WHERE m.home_guild_id = %s OR m.away_guild_id = %s"
        params.extend([team_id, team_id])
    params.extend([limit, offset])

    return await fetch_all(
        request,
        f"""
        SELECT {MATCH_SELECT_FIELDS}
        {MATCH_SELECT_FROM}
        {where}
        ORDER BY m.match_datetime DESC
        LIMIT %s OFFSET %s
        """,
        tuple(params),
    )


@app.get("/api/matches/{match_stats_id}")
async def get_match(request: Request, match_stats_id: int):
    match = await fetch_one(
        request,
        f"""
        SELECT {MATCH_SELECT_FIELDS}
        {MATCH_SELECT_FROM}
        WHERE m.match_stats_id = %s
        """,
        (match_stats_id,),
    )
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    match["lineups"] = await fetch_all(
        request,
        "SELECT * FROM hub_match_lineups WHERE match_stats_id = %s ORDER BY side, slot_order, position_code",
        (match_stats_id,),
    )
    match["player_stats"] = await fetch_all(
        request,
        "SELECT * FROM hub_match_player_stats WHERE match_stats_id = %s ORDER BY team_side, position_code, player_name",
        (match_stats_id,),
    )
    match["events"] = await fetch_all(
        request,
        "SELECT * FROM hub_match_events WHERE match_stats_id = %s ORDER BY match_second, event_index",
        (match_stats_id,),
    )
    return match


@app.get("/api/tournaments")
async def list_tournaments(request: Request, limit: int = Query(50, ge=1, le=100), offset: int = Query(0, ge=0)):
    return await fetch_all(
        request,
        """
        SELECT *
        FROM hub_tournaments
        ORDER BY created_at DESC
        LIMIT %s OFFSET %s
        """,
        (limit, offset),
    )


@app.get("/api/tournaments/{tournament_id}")
async def get_tournament(request: Request, tournament_id: int):
    tournament = await fetch_one(request, "SELECT * FROM hub_tournaments WHERE tournament_id = %s", (tournament_id,))
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")

    tournament["teams"] = await fetch_all(
        request,
        "SELECT * FROM hub_tournament_teams WHERE tournament_id = %s ORDER BY league_key, seed, team_name",
        (tournament_id,),
    )
    tournament["standings"] = await fetch_all(
        request,
        "SELECT * FROM v_hub_tournament_standings_enriched WHERE tournament_id = %s ORDER BY points DESC, goal_diff DESC, goals_for DESC, team_name ASC",
        (tournament_id,),
    )
    tournament["fixtures"] = await fetch_all(
        request,
        """
        SELECT
            fixture.*,
            played.match_datetime AS played_match_datetime,
            played.home_score AS played_home_score,
            played.away_score AS played_away_score,
            played.game_type AS played_game_type,
            played.match_id AS played_match_id,
            played.home_team_name AS played_home_team_name,
            played.away_team_name AS played_away_team_name
        FROM hub_tournament_fixtures fixture
        LEFT JOIN (
            SELECT
                m.match_stats_id,
                m.match_id,
                m.match_datetime,
                m.home_team_name,
                m.away_team_name,
                m.home_score,
                m.away_score,
                m.game_type
            FROM v_hub_match_overview m
        ) played ON played.match_stats_id = fixture.played_match_stats_id
        WHERE fixture.tournament_id = %s
        ORDER BY fixture.league_key, fixture.week_number, fixture.fixture_id
        """,
        (tournament_id,),
    )
    return tournament


@app.get("/api/media")
async def list_media(
    request: Request,
    media_type: str = "",
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    where = "WHERE is_public = TRUE"
    params: list[Any] = []
    if media_type.strip():
        where += " AND media_type = %s"
        params.append(media_type.strip())
    params.extend([limit, offset])

    return await fetch_all(
        request,
        f"""
        SELECT *
        FROM hub_media_assets
        {where}
        ORDER BY created_at DESC
        LIMIT %s OFFSET %s
        """,
        tuple(params),
    )


@app.get("/api/sync-state")
async def sync_state(request: Request):
    return await fetch_all(
        request,
        "SELECT * FROM hub_sync_state ORDER BY updated_at DESC",
    )
