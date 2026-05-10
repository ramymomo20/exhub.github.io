from __future__ import annotations

import asyncio
import sys
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.db import create_mysql_pool  # noqa: E402


def _split_sql(sql: str) -> list[str]:
    statements: list[str] = []
    current: list[str] = []
    in_single = False
    in_double = False

    cleaned_sql = "\n".join(
        line for line in sql.splitlines()
        if not line.strip().startswith("--")
    )

    for char in cleaned_sql:
        if char == "'" and not in_double:
            in_single = not in_single
        elif char == '"' and not in_single:
            in_double = not in_double

        if char == ";" and not in_single and not in_double:
            statement = "".join(current).strip()
            if statement:
                statements.append(statement)
            current = []
            continue
        current.append(char)

    tail = "".join(current).strip()
    if tail:
        statements.append(tail)
    return statements


async def main() -> None:
    migration_paths = sorted((BACKEND_DIR / "migrations").glob("*.sql"))

    pool = await create_mysql_pool()
    total_statements = 0
    try:
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                for migration_path in migration_paths:
                    sql = migration_path.read_text(encoding="utf-8")
                    statements = _split_sql(sql)
                    for statement in statements:
                        await cur.execute(statement)
                    total_statements += len(statements)
            await conn.commit()
    finally:
        pool.close()
        await pool.wait_closed()

    print(f"Applied {len(migration_paths)} MySQL migration files / {total_statements} statements.")


if __name__ == "__main__":
    asyncio.run(main())
