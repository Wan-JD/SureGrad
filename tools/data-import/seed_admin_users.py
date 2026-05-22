"""Seed default admin accounts for local development and visual QA."""

from __future__ import annotations

import argparse
import hashlib
import secrets
import sys
from pathlib import Path

from db import connect, resolve_database_settings

SCRYPT_PREFIX = "scrypt"
SCRYPT_N = 16384
SCRYPT_R = 8
SCRYPT_P = 1
SCRYPT_KEYLEN = 64

DEFAULT_ACCOUNTS = [
    {
        "username": "superadmin",
        "display_name": "超级管理员",
        "password": "super123",
        "role": "super_admin",
    },
    {
        "username": "admin",
        "display_name": "运营管理员",
        "password": "admin123",
        "role": "admin",
    },
]


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.scrypt(
        password.encode("utf-8"),
        salt=bytes.fromhex(salt),
        n=SCRYPT_N,
        r=SCRYPT_R,
        p=SCRYPT_P,
        dklen=SCRYPT_KEYLEN,
    )
    return f"{SCRYPT_PREFIX}${salt}${digest.hex()}"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--only-if-empty", action="store_true")
    args = parser.parse_args()

    settings = resolve_database_settings({})

    try:
        with connect(settings) as conn:
            count_row = conn.execute(
                "SELECT COUNT(*)::int AS count FROM admin_users"
            ).fetchone()
            existing = int(count_row["count"]) if count_row else 0

            if args.only_if_empty and existing > 0:
                print(f"admin_users already has {existing} row(s); skip seed")
                return 0

            for account in DEFAULT_ACCOUNTS:
                password_hash = hash_password(account["password"])
                conn.execute(
                    """
                    INSERT INTO admin_users (
                        username,
                        display_name,
                        password_hash,
                        role,
                        status
                    )
                    VALUES (%s, %s, %s, %s, 'active')
                    ON CONFLICT (username) DO UPDATE
                    SET
                        display_name = EXCLUDED.display_name,
                        password_hash = EXCLUDED.password_hash,
                        role = EXCLUDED.role,
                        status = 'active',
                        updated_at = NOW()
                    """,
                    (
                        account["username"],
                        account["display_name"],
                        password_hash,
                        account["role"],
                    ),
                )
                print(f"Seeded admin user: {account['username']} ({account['role']})")
    except Exception as exc:  # noqa: BLE001
        print(f"seed_admin_users failed: {exc}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
