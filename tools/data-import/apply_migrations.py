"""Apply SQL files under tools/data-import/migrations in sorted order."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from db import connect, resolve_database_settings

MIGRATIONS_DIR = Path(__file__).resolve().parent / "migrations"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dir", default=str(MIGRATIONS_DIR))
    args = parser.parse_args()

    migrations_dir = Path(args.dir).resolve()
    files = sorted(migrations_dir.glob("*.sql"))
    if not files:
        print(f"No migrations in {migrations_dir}")
        return 0

    settings = resolve_database_settings({})

    try:
        with connect(settings) as conn:
            for path in files:
                sql = path.read_text(encoding="utf-8")
                conn.execute(sql)
                print(f"Applied: {path.name}")
    except Exception as exc:  # noqa: BLE001
        print(f"apply_migrations failed: {exc}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
