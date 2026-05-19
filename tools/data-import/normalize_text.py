from __future__ import annotations

import argparse
import csv
import io
import json
import re
import sys
import unicodedata
from datetime import datetime
from decimal import Decimal, InvalidOperation
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from csv_specs import DATASET_SPECS

PLACEHOLDERS = {
    "--",
    "-",
    "n/a",
    "na",
    "null",
    "none",
    "\u6682\u65e0",
    "\u5f85\u5b9a",
    "\u672a\u516c\u5e03",
    "\u65e0",
}
TRUE_VALUES = {"1", "true", "t", "yes", "y", "on", "\u662f"}
FALSE_VALUES = {"0", "false", "f", "no", "n", "off", "\u5426"}
DATE_FORMATS = ("%Y-%m-%d", "%Y/%m/%d", "%Y.%m.%d", "%Y\u5e74%m\u6708%d\u65e5")
DATETIME_FORMATS = (
    "%Y-%m-%dT%H:%M:%S%z",
    "%Y-%m-%d %H:%M:%S%z",
    "%Y/%m/%d %H:%M:%S%z",
    "%Y-%m-%dT%H:%M:%S",
    "%Y-%m-%d %H:%M:%S",
    "%Y/%m/%d %H:%M:%S",
    "%Y.%m.%d %H:%M:%S",
    "%Y-%m-%d",
    "%Y/%m/%d",
    "%Y.%m.%d",
    "%Y\u5e74%m\u6708%d\u65e5",
)
TRACKING_QUERY_KEYS = {
    "from",
    "sessionid",
    "source",
    "spm",
    "utm_campaign",
    "utm_content",
    "utm_medium",
    "utm_source",
    "utm_term",
}
SPACE_RE = re.compile(r"\s+")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Normalize SureGrad import CSV files.")
    parser.add_argument("--input", required=True, help="Input CSV file or directory.")
    parser.add_argument("--output-dir", required=True, help="Directory for normalized CSV files.")
    parser.add_argument("--report-file", help="Optional path to write a machine-readable JSON normalization report.")
    return parser.parse_args()


def resolve_input_files(raw_input: str) -> list[Path]:
    path = Path(raw_input).resolve()
    if path.is_dir():
        return sorted(path.glob("*.csv"))
    if path.is_file():
        return [path]
    raise FileNotFoundError(f"Input path not found: {path}")


def decode_utf8(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8-sig")
    except UnicodeDecodeError as exc:
        raise ValueError(f"{path.name}: file must be UTF-8 or UTF-8 with BOM ({exc})") from exc


def normalize_text_value(value: str) -> str:
    normalized = unicodedata.normalize("NFKC", value or "")
    normalized = normalized.replace("\u00a0", " ").replace("\u3000", " ")
    normalized = SPACE_RE.sub(" ", normalized).strip()
    if normalized.lower() in PLACEHOLDERS:
        return ""
    return normalized


def normalize_bool(value: str) -> str:
    lowered = value.lower()
    if lowered in TRUE_VALUES:
        return "true"
    if lowered in FALSE_VALUES:
        return "false"
    return value


def normalize_int(value: str) -> str:
    candidate = value.replace(",", "")
    candidate = re.sub(r"[\u4eba\u4e2a\u540d\u9879]$", "", candidate)
    try:
        decimal_value = Decimal(candidate)
    except InvalidOperation:
        return value
    if decimal_value != decimal_value.to_integral_value():
        return value
    return str(int(decimal_value))


def normalize_decimal(value: str) -> str:
    candidate = value.replace(",", "")
    candidate = candidate.replace("%", "")
    candidate = re.sub(r"[:\uff1a]1$", "", candidate)
    candidate = re.sub(r"(\u5143/\u5e74|\u5143|\u5e74)$", "", candidate)
    try:
        decimal_value = Decimal(candidate)
    except InvalidOperation:
        return value
    normalized = format(decimal_value.normalize(), "f")
    if "." in normalized:
        normalized = normalized.rstrip("0").rstrip(".")
    return normalized or "0"


def normalize_date(value: str) -> str:
    for fmt in DATE_FORMATS:
        try:
            return datetime.strptime(value, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return value


def normalize_datetime(value: str) -> str:
    for fmt in DATETIME_FORMATS:
        try:
            parsed = datetime.strptime(value, fmt)
        except ValueError:
            continue
        if parsed.tzinfo is None:
            if fmt in DATE_FORMATS or fmt in ("%Y-%m-%d", "%Y/%m/%d", "%Y.%m.%d", "%Y\u5e74%m\u6708%d\u65e5"):
                return parsed.strftime("%Y-%m-%dT00:00:00+08:00")
            return parsed.strftime("%Y-%m-%dT%H:%M:%S+08:00")
        return parsed.isoformat(timespec="seconds")
    return value


def normalize_url(value: str) -> str:
    parts = urlsplit(value)
    if parts.scheme not in {"http", "https"} or not parts.netloc:
        return value
    filtered_query = [
        (key, item)
        for key, item in parse_qsl(parts.query, keep_blank_values=True)
        if key.lower() not in TRACKING_QUERY_KEYS
    ]
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(filtered_query), ""))


def normalize_field(filename: str, field_name: str, value: str) -> str:
    spec = DATASET_SPECS[filename]
    normalized = normalize_text_value(value)
    if normalized == "":
        return ""

    if field_name in spec.get("bool_fields", set()):
        return normalize_bool(normalized)
    if field_name in spec.get("int_fields", set()):
        return normalize_int(normalized)
    if field_name in spec.get("decimal_fields", set()):
        return normalize_decimal(normalized)
    if field_name in spec.get("date_fields", set()):
        return normalize_date(normalized)
    if field_name in spec.get("datetime_fields", set()):
        return normalize_datetime(normalized)
    if field_name in spec.get("url_fields", set()):
        return normalize_url(normalized)
    return normalized


def normalize_file(path: Path, output_dir: Path) -> tuple[int, int]:
    spec = DATASET_SPECS.get(path.name)
    if spec is None:
        raise ValueError(f"{path.name}: unknown CSV template")

    content = decode_utf8(path)
    reader = csv.DictReader(io.StringIO(content))
    if (reader.fieldnames or []) != spec["columns"]:
        raise ValueError(f"{path.name}: header must match template before normalization")

    rows = list(reader)
    changed_cells = 0
    written_rows = 0

    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / path.name

    with output_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=spec["columns"])
        writer.writeheader()
        for row in rows:
            normalized_row: dict[str, str] = {}
            if None in row:
                raise ValueError(f"{path.name}: row has too many columns")
            for field_name in spec["columns"]:
                original = row.get(field_name, "") or ""
                normalized = normalize_field(path.name, field_name, original)
                normalized_row[field_name] = normalized
                if normalized != original:
                    changed_cells += 1
            if any(value != "" for value in normalized_row.values()):
                written_rows += 1
            writer.writerow(normalized_row)

    return written_rows, changed_cells


def main() -> int:
    args = parse_args()

    try:
        files = resolve_input_files(args.input)
    except FileNotFoundError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    if not files:
        print("ERROR: no CSV files found", file=sys.stderr)
        return 1

    output_dir = Path(args.output_dir).resolve()
    total_rows = 0
    total_changes = 0
    file_reports: list[dict[str, int | str]] = []

    for path in files:
        try:
            written_rows, changed_cells = normalize_file(path, output_dir)
        except ValueError as exc:
            print(f"ERROR: {exc}", file=sys.stderr)
            if args.report_file:
                report_path = Path(args.report_file).resolve()
                report_path.parent.mkdir(parents=True, exist_ok=True)
                report_path.write_text(
                    json.dumps(
                        {
                            "tool": "normalize_text",
                            "ok": False,
                            "exit_code": 1,
                            "summary": {"files": 0, "rows": 0, "changed_cells": 0, "output_dir": str(output_dir)},
                            "files": [],
                            "fatal_error": str(exc),
                        },
                        ensure_ascii=False,
                        indent=2,
                    ),
                    encoding="utf-8",
                )
            return 1
        total_rows += written_rows
        total_changes += changed_cells
        file_reports.append(
            {
                "file": path.name,
                "rows": written_rows,
                "changed_cells": changed_cells,
            }
        )
        print(f"OK: {path.name} rows={written_rows} changed_cells={changed_cells}")

    print(f"Summary: files={len(files)} rows={total_rows} changed_cells={total_changes} output_dir={output_dir}")

    if args.report_file:
        report_path = Path(args.report_file).resolve()
        report_path.parent.mkdir(parents=True, exist_ok=True)
        report_path.write_text(
            json.dumps(
                {
                    "tool": "normalize_text",
                    "ok": True,
                    "exit_code": 0,
                    "summary": {
                        "files": len(files),
                        "rows": total_rows,
                        "changed_cells": total_changes,
                        "output_dir": str(output_dir),
                    },
                    "files": file_reports,
                },
                ensure_ascii=False,
                indent=2,
            ),
            encoding="utf-8",
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
