from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Any

import asyncpg

from . import config


async def _create_pool(*, search_path: str | None = None) -> asyncpg.Pool:
    async def init_connection(conn: asyncpg.Connection) -> None:
        if search_path:
            await conn.execute(f"SET search_path TO {search_path}")

    return await asyncpg.create_pool(
        config.postgres_dsn(),
        min_size=config.POSTGRES_POOL_MIN_SIZE,
        max_size=config.POSTGRES_POOL_MAX_SIZE,
        command_timeout=120,
        statement_cache_size=0,
        init=init_connection,
    )


async def create_postgres_pool() -> asyncpg.Pool:
    return await _create_pool()


async def create_hub_postgres_pool() -> asyncpg.Pool:
    return await _create_pool(search_path=f"{config.HUB_POSTGRES_SCHEMA},public")


def public_row(value: Any) -> Any:
    if isinstance(value, dict):
        return {key: public_row(item) for key, item in value.items()}
    if isinstance(value, list):
        return [public_row(item) for item in value]
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    return value


def public_rows(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [public_row(dict(row)) for row in rows]
