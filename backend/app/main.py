from __future__ import annotations

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


async def fetch_all(request: Request, sql: str, params: tuple[Any, ...] = ()) -> list[dict[str, Any]]:
    async with mysql_cursor(request.app.state.mysql_pool) as (_, cur):
        await cur.execute(sql, params)
        return public_rows(await cur.fetchall())


async def fetch_one(request: Request, sql: str, params: tuple[Any, ...]) -> dict[str, Any] | None:
    async with mysql_cursor(request.app.state.mysql_pool) as (_, cur):
        await cur.execute(sql, params)
        row = await cur.fetchone()
        return public_row(dict(row)) if row else None


@app.get("/health")
async def health(request: Request):
    async with mysql_cursor(request.app.state.mysql_pool) as (_, cur):
        await cur.execute("SELECT 1 AS ok")
        row = await cur.fetchone()
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
        where = "WHERE display_name LIKE %s OR steam_id LIKE %s"
        like = f"%{q.strip()}%"
        params.extend([like, like])

    params.extend([limit, offset])
    return await fetch_all(
        request,
        f"""
        SELECT *
        FROM v_hub_player_totals
        {where}
        ORDER BY rating DESC, display_name ASC
        LIMIT %s OFFSET %s
        """,
        tuple(params),
    )


@app.get("/api/players/{steam_id}")
async def get_player(request: Request, steam_id: str):
    player = await fetch_one(request, "SELECT * FROM v_hub_player_totals WHERE steam_id = %s", (steam_id,))
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    player["recent_matches"] = await fetch_all(
        request,
        """
        SELECT pmd.*, m.match_datetime, m.home_team_name, m.away_team_name, m.home_score, m.away_score
        FROM hub_match_player_stats pmd
        JOIN hub_matches m ON m.match_stats_id = pmd.match_stats_id
        WHERE pmd.steam_id = %s
        ORDER BY m.match_datetime DESC
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
        """
        SELECT *
        FROM v_hub_match_overview
        WHERE home_guild_id = %s OR away_guild_id = %s
        ORDER BY match_datetime DESC
        LIMIT 20
        """,
        (guild_id, guild_id),
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
        where = "WHERE home_guild_id = %s OR away_guild_id = %s"
        params.extend([team_id, team_id])
    params.extend([limit, offset])

    return await fetch_all(
        request,
        f"""
        SELECT *
        FROM v_hub_match_overview
        {where}
        ORDER BY match_datetime DESC
        LIMIT %s OFFSET %s
        """,
        tuple(params),
    )


@app.get("/api/matches/{match_stats_id}")
async def get_match(request: Request, match_stats_id: int):
    match = await fetch_one(request, "SELECT * FROM v_hub_match_overview WHERE match_stats_id = %s", (match_stats_id,))
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
        "SELECT * FROM hub_tournament_fixtures WHERE tournament_id = %s ORDER BY league_key, week_number, fixture_id",
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
