from __future__ import annotations

import json
from typing import Any

from . import config

try:
    from redis.asyncio import Redis
except ImportError:  # pragma: no cover - optional dependency
    Redis = None  # type: ignore[assignment]


async def create_redis_client() -> Redis | None:
    if not config.REDIS_URL:
        return None
    if Redis is None:
        raise RuntimeError("HUB_REDIS_URL is set but the redis package is not installed")
    return Redis.from_url(config.REDIS_URL, decode_responses=True)


async def close_redis_client(client: Redis | None) -> None:
    if client is None:
        return
    await client.aclose()


async def get_json(client: Redis | None, key: str) -> Any | None:
    if client is None:
        return None
    try:
        payload = await client.get(key)
    except Exception:  # pragma: no cover - cache should fail open
        return None
    if payload is None:
        return None
    return json.loads(payload)


async def set_json(client: Redis | None, key: str, value: Any, ttl_seconds: int) -> None:
    if client is None or ttl_seconds <= 0:
        return
    try:
        await client.set(key, json.dumps(value), ex=ttl_seconds)
    except Exception:  # pragma: no cover - cache should fail open
        return
