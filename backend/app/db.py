from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import date, datetime
from decimal import Decimal
from typing import Any
from urllib.parse import unquote, urlparse

import aiomysql
import asyncpg

from . import config


def parse_mysql_dsn(dsn: str) -> dict[str, Any]:
    parsed = urlparse(dsn)
    if parsed.scheme not in {"mysql", "mysql+pymysql", "aiomysql"}:
        raise RuntimeError(f"Unsupported MySQL DSN scheme: {parsed.scheme}")

    return {
        "host": parsed.hostname or "localhost",
        "port": parsed.port or 3306,
        "user": unquote(parsed.username or ""),
        "password": unquote(parsed.password or ""),
        "db": (parsed.path or "").lstrip("/"),
        "autocommit": False,
        "charset": "utf8mb4",
        "cursorclass": aiomysql.DictCursor,
    }


async def create_mysql_pool() -> aiomysql.Pool:
    kwargs = parse_mysql_dsn(config.mysql_dsn())
    return await aiomysql.create_pool(
        **kwargs,
        minsize=config.MYSQL_POOL_MIN_SIZE,
        maxsize=config.MYSQL_POOL_MAX_SIZE,
        pool_recycle=config.MYSQL_POOL_RECYCLE_SECONDS,
        connect_timeout=config.MYSQL_CONNECT_TIMEOUT_SECONDS,
    )


async def create_postgres_pool() -> asyncpg.Pool:
    return await asyncpg.create_pool(
        config.postgres_dsn(),
        min_size=config.POSTGRES_POOL_MIN_SIZE,
        max_size=config.POSTGRES_POOL_MAX_SIZE,
        command_timeout=120,
        statement_cache_size=0,
    )


@asynccontextmanager
async def mysql_cursor(pool: aiomysql.Pool):
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            yield conn, cur


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
