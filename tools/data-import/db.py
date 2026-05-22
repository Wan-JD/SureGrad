from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any

import psycopg
from psycopg import Connection
from psycopg.rows import dict_row


@dataclass(frozen=True)
class DatabaseSettings:
    host: str
    port: int
    name: str
    user: str
    password: str
    schema: str = "public"

    @property
    def conninfo(self) -> str:
        return (
            f"host={self.host} port={self.port} dbname={self.name} "
            f"user={self.user} password={self.password}"
        )


def resolve_database_settings(config: dict[str, Any]) -> DatabaseSettings:
    db = config.get("database") if isinstance(config.get("database"), dict) else {}
    return DatabaseSettings(
        host=str(db.get("host") or os.getenv("DATABASE_HOST", "127.0.0.1")),
        port=int(db.get("port") or os.getenv("DATABASE_PORT", "5432")),
        name=str(db.get("name") or os.getenv("DATABASE_NAME", "suregrad")),
        user=str(db.get("user") or os.getenv("DATABASE_USER", "postgres")),
        password=str(db.get("password") or os.getenv("DATABASE_PASSWORD", "postgres")),
        schema=str(db.get("schema") or os.getenv("DATABASE_SCHEMA", "public")),
    )


def connect(settings: DatabaseSettings) -> Connection[Any]:
    conn = psycopg.connect(settings.conninfo, row_factory=dict_row)
    conn.execute(f"SET search_path TO {settings.schema}")
    return conn


def parse_bool(value: str | None) -> bool:
    if value is None:
        return False
    normalized = value.strip().lower()
    return normalized in {"true", "1", "yes", "on"}


def empty_to_none(value: str | None) -> str | None:
    if value is None:
        return None
    stripped = value.strip()
    return stripped if stripped else None


def normalize_research_direction(value: str | None) -> str | None:
    return empty_to_none(value)
