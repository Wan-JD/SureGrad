"""Idempotent demo seed for subjects and study_resources (MVP study materials)."""

from __future__ import annotations

import sys
from dataclasses import dataclass
from typing import Any

from db import connect, resolve_database_settings

SUBJECT_ROWS: tuple[tuple[str, str, str | None, str], ...] = (
    ("a1000001-0001-4001-8001-000000000001", "思想政治理论", "POL", "politics"),
    ("a1000001-0001-4001-8001-000000000002", "英语", "ENG", "english"),
    ("a1000001-0001-4001-8001-000000000003", "数学", "MATH", "math"),
    ("a1000001-0001-4001-8001-000000000004", "专业课", "MAJOR", "major"),
)

# id, title, resource_type, subject_id, stage_tag, source_url, provider_name, summary, usage_advice
RESOURCE_ROWS: tuple[tuple[str, str, str, str | None, str, str, str, str | None, str | None], ...] = (
    (
        "b2000001-0001-4001-8001-000000000001",
        "政治基础精讲（演示）",
        "course",
        "a1000001-0001-4001-8001-000000000001",
        "foundation",
        "https://example.com/demo/politics-foundation",
        "SureGrad Demo",
        "马原与思修入门串讲，适合首轮系统过一遍。",
        "每天 1 小时，配合章节练习。",
    ),
    (
        "b2000001-0001-4001-8001-000000000002",
        "考研英语词汇书（演示）",
        "book",
        "a1000001-0001-4001-8001-000000000002",
        "foundation",
        "https://example.com/demo/english-vocab",
        "Open Press Demo",
        "5500 词分级背诵，含例句与真题词频标注。",
        "晨读 30 分钟 + 晚间复习。",
    ),
    (
        "b2000001-0001-4001-8001-000000000003",
        "高数强化专题课（演示）",
        "course",
        "a1000001-0001-4001-8001-000000000003",
        "intensive",
        "https://example.com/demo/math-intensive",
        "SureGrad Demo",
        "极限、微分、积分专题刷题与错题复盘。",
        "每周 3 次，每次 90 分钟。",
    ),
    (
        "b2000001-0001-4001-8001-000000000004",
        "专业课公开参考书目（演示）",
        "public_resource",
        "a1000001-0001-4001-8001-000000000004",
        "intensive",
        "https://example.com/demo/major-public-list",
        "院校公开目录",
        "汇总常见院校专业课参考书与官方说明链接。",
        "对照目标院校招生目录勾选已读章节。",
    ),
    (
        "b2000001-0001-4001-8001-000000000005",
        "政治冲刺背诵手册（演示）",
        "book",
        "a1000001-0001-4001-8001-000000000001",
        "final",
        "https://example.com/demo/politics-final",
        "SureGrad Demo",
        "考前 30 天高频考点与主观题答题框架。",
        "最后两周集中背记 + 模拟卷套用。",
    ),
    (
        "b2000001-0001-4001-8001-000000000006",
        "英语真题精读资料包（演示）",
        "public_resource",
        "a1000001-0001-4001-8001-000000000002",
        "final",
        "https://example.com/demo/english-final-pack",
        "Public Archive Demo",
        "近十年阅读与完形真题解析与词汇笔记合集。",
        "按年份刷完一套再复盘错题。",
    ),
)

UPSERT_SUBJECT_SQL = """
INSERT INTO subjects (id, name, code, category)
VALUES (%s, %s, %s, %s)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    category = EXCLUDED.category,
    updated_at = NOW()
"""

UPSERT_RESOURCE_SQL = """
INSERT INTO study_resources (
    id,
    title,
    resource_type,
    subject_id,
    stage_tag,
    source_url,
    provider_name,
    summary,
    usage_advice,
    is_public_legal,
    status
)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, TRUE, 'active')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    resource_type = EXCLUDED.resource_type,
    subject_id = EXCLUDED.subject_id,
    stage_tag = EXCLUDED.stage_tag,
    source_url = EXCLUDED.source_url,
    provider_name = EXCLUDED.provider_name,
    summary = EXCLUDED.summary,
    usage_advice = EXCLUDED.usage_advice,
    is_public_legal = EXCLUDED.is_public_legal,
    status = EXCLUDED.status,
    updated_at = NOW()
"""


@dataclass(frozen=True)
class SeedCounts:
    subjects: int
    resources: int


def seed_study_resources(conn: Any) -> SeedCounts:
    for row in SUBJECT_ROWS:
        conn.execute(UPSERT_SUBJECT_SQL, row)

    for row in RESOURCE_ROWS:
        conn.execute(UPSERT_RESOURCE_SQL, row)

    conn.commit()
    return SeedCounts(subjects=len(SUBJECT_ROWS), resources=len(RESOURCE_ROWS))


def main() -> int:
    settings = resolve_database_settings({})

    try:
        with connect(settings) as conn:
            counts = seed_study_resources(conn)
    except Exception as exc:  # noqa: BLE001
        print(f"seed_study_resources failed: {exc}", file=sys.stderr)
        return 1

    print(
        f"Seeded study demo data: subjects={counts.subjects}, "
        f"study_resources={counts.resources} (idempotent upsert by fixed UUID)"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
