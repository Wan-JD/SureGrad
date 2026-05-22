"""Apply docs/schema.sql to PostgreSQL (uses DATABASE_* env or defaults)."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from db import connect, resolve_database_settings

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_SCHEMA = ROOT / "docs" / "schema.sql"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--schema", default=str(DEFAULT_SCHEMA))
    args = parser.parse_args()

    schema_path = Path(args.schema).resolve()
    if not schema_path.exists():
        print(f"Schema not found: {schema_path}", file=sys.stderr)
        return 1

    settings = resolve_database_settings({})
    sql = schema_path.read_text(encoding="utf-8")

    try:
        with connect(settings) as conn:
            conn.execute(sql)
    except Exception as exc:  # noqa: BLE001
        print(f"apply_schema failed: {exc}", file=sys.stderr)
        return 1

    print(f"Applied schema: {schema_path} -> {settings.name}@{settings.host}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
