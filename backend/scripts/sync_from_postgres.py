from __future__ import annotations

import asyncio
import sys
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.db import create_mysql_pool, create_postgres_pool  # noqa: E402
from app.sync import sync_all  # noqa: E402


async def main() -> None:
    pg_pool = await create_postgres_pool()
    mysql_pool = await create_mysql_pool()
    try:
        results = await sync_all(pg_pool, mysql_pool)
    finally:
        await pg_pool.close()
        mysql_pool.close()
        await mysql_pool.wait_closed()

    total = 0
    for result in results:
        total += result.rows
        print(f"{result.table}: {result.rows}")
    print(f"total: {total}")


if __name__ == "__main__":
    asyncio.run(main())
