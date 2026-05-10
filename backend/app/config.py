from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv


ROOT_DIR = Path(__file__).resolve().parents[3]
BACKEND_DIR = Path(__file__).resolve().parents[1]

load_dotenv(ROOT_DIR / ".env")
load_dotenv(BACKEND_DIR / ".env")


def _env(name: str, default: str = "") -> str:
    return str(os.getenv(name, default)).strip()


def mysql_dsn() -> str:
    dsn = _env("MYSQL_CONNECTION_STRING")
    if dsn:
        return dsn

    user = _env("MYSQL_USERNAME")
    password = _env("MYSQL_PASSWORD")
    host_port = _env("MYSQL_ENDPOINT", "localhost:3306")
    database = _env("MYSQL_DATABASE")
    if not user or not database:
        raise RuntimeError("MYSQL_CONNECTION_STRING or MYSQL_USERNAME/MYSQL_DATABASE is required")

    return f"mysql://{user}:{password}@{host_port}/{database}"


def postgres_dsn() -> str:
    dsn = _env("SUPABASE_DB_URL") or _env("SUPABASE_POOLER_URL")
    if not dsn:
        raise RuntimeError("SUPABASE_DB_URL or SUPABASE_POOLER_URL is required")
    return dsn


API_TITLE = _env("IOSCA_HUB_API_TITLE", "IOSCA Hub API")
API_VERSION = _env("IOSCA_HUB_API_VERSION", "0.1.0")
MYSQL_POOL_MIN_SIZE = int(_env("HUB_MYSQL_POOL_MIN_SIZE", "1"))
MYSQL_POOL_MAX_SIZE = int(_env("HUB_MYSQL_POOL_MAX_SIZE", "10"))
POSTGRES_POOL_MIN_SIZE = int(_env("HUB_POSTGRES_POOL_MIN_SIZE", "1"))
POSTGRES_POOL_MAX_SIZE = int(_env("HUB_POSTGRES_POOL_MAX_SIZE", "5"))
