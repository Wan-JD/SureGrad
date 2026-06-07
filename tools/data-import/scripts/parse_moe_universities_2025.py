"""Generate SureGrad schools.csv from the official MOE 2025 university list.

Source page:
https://www.moe.gov.cn/jyb_xxgk/s5743/s5744/202506/t20250627_1195683.html

The source workbook is the official attachment named:
W020250729615142156867.xls
"""

from __future__ import annotations

import argparse
import csv
from collections import Counter
from pathlib import Path
from typing import Any

import xlrd

EXPECTED_TOTAL = 2919
EXPECTED_LEVEL_COUNTS = {"本科": 1365, "专科": 1554}

CSV_COLUMNS = [
    "name",
    "short_name",
    "code",
    "province",
    "city",
    "school_type",
    "school_level",
    "has_graduate_school",
    "official_website",
    "graduate_website",
    "description",
    "sort_order",
    "status",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Parse the official MOE 2025 university XLS into SureGrad schools.csv.",
    )
    parser.add_argument(
        "--input",
        required=True,
        type=Path,
        help="Path to the official MOE .xls attachment.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("tools/data-import/collected/moe-universities-2025/schools.csv"),
        help="Output schools.csv path.",
    )
    return parser.parse_args()


def is_number(value: Any) -> bool:
    return isinstance(value, (int, float)) and value == value


def parse_section(text: str) -> tuple[str, int]:
    marker = "（"
    suffix = "所）"
    text = text.strip()
    if not text.endswith(suffix) or marker not in text:
        raise ValueError(f"Unrecognized province section row: {text!r}")
    province, right = text.rsplit(marker, 1)
    return province, int(right[: -len(suffix)])


def parse_code(value: Any) -> str:
    if is_number(value):
        return str(int(value))

    text = str(value).strip()
    if text.endswith(".0") and text[:-2].isdigit():
        return text[:-2]
    if text and not text.isdigit():
        raise ValueError(f"Invalid school code: {text!r}")
    return text


def read_rows(input_path: Path) -> list[dict[str, str]]:
    book = xlrd.open_workbook(str(input_path))
    sheet = book.sheet_by_index(0)

    province = ""
    province_counts: dict[str, int] = {}
    rows: list[dict[str, str]] = []

    for row_index in range(3, sheet.nrows):
        cells = [sheet.cell_value(row_index, column_index) for column_index in range(sheet.ncols)]
        first = cells[0]

        if isinstance(first, str) and first.strip():
            province, count = parse_section(first)
            province_counts[province] = count
            continue

        if not is_number(first):
            continue

        name = str(cells[1]).strip()
        if not name:
            continue

        city = str(cells[4]).strip()
        school_level = str(cells[5]).strip()
        department = str(cells[3]).strip()
        remark = str(cells[6]).strip()
        if not province or not city or not school_level:
            raise ValueError(f"Missing required field at workbook row {row_index + 1}: {name}")

        description_parts = [
            f"教育部全国普通高等学校名单记录：主管部门={department}",
            f"办学层次={school_level}",
        ]
        if remark:
            description_parts.append(f"备注={remark}")

        rows.append(
            {
                "name": name,
                "short_name": name,
                "code": parse_code(cells[2]),
                "province": province,
                "city": city,
                "school_type": "未分类",
                "school_level": school_level,
                "has_graduate_school": "false",
                "official_website": "",
                "graduate_website": "",
                "description": "；".join(description_parts)
                + "。官网与研究生院链接待逐校官方核验后补充。",
                "sort_order": str(int(first)),
                "status": "active",
            },
        )

    validate_rows(rows, province_counts)
    return rows


def validate_rows(rows: list[dict[str, str]], province_counts: dict[str, int]) -> None:
    if len(rows) != EXPECTED_TOTAL:
        raise ValueError(f"Expected {EXPECTED_TOTAL} schools, got {len(rows)}")

    level_counts = Counter(row["school_level"] for row in rows)
    if dict(level_counts) != EXPECTED_LEVEL_COUNTS:
        raise ValueError(f"Unexpected level counts: {dict(level_counts)}")

    if sum(province_counts.values()) != len(rows):
        raise ValueError(
            f"Province section counts sum to {sum(province_counts.values())}, got {len(rows)} rows",
        )

    for province, expected in province_counts.items():
        actual = sum(1 for row in rows if row["province"] == province)
        if actual != expected:
            raise ValueError(f"Province {province} expected {expected}, got {actual}")

    duplicate_name_city = [
        key
        for key, count in Counter((row["name"], row["city"]) for row in rows).items()
        if count > 1
    ]
    if duplicate_name_city:
        raise ValueError(f"Duplicate school name/city keys: {duplicate_name_city[:10]}")

    duplicate_codes = [
        code
        for code, count in Counter(row["code"] for row in rows if row["code"]).items()
        if count > 1
    ]
    if duplicate_codes:
        raise ValueError(f"Duplicate school codes: {duplicate_codes[:10]}")


def write_csv(rows: list[dict[str, str]], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8", newline="") as output_file:
        writer = csv.DictWriter(output_file, fieldnames=CSV_COLUMNS)
        writer.writeheader()
        writer.writerows(rows)


def main() -> int:
    args = parse_args()
    rows = read_rows(args.input)
    write_csv(rows, args.output)
    level_counts = Counter(row["school_level"] for row in rows)
    print(f"wrote {len(rows)} schools to {args.output}")
    print(f"level_counts={dict(level_counts)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
