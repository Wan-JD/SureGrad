from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from collections import Counter
from datetime import datetime
from pathlib import Path
from typing import Any

from csv_specs import DATASET_SPECS, DEFAULT_TEMPLATE_FILES

CORE_TEMPLATE_FILES = [
    "schools.csv",
    "departments.csv",
    "programs.csv",
    "program_score_lines.csv",
    "program_source_links.csv",
]

YEARLY_TEMPLATE_FILES = [
    "program_admissions.csv",
    "program_score_lines.csv",
    "program_application_stats.csv",
    "program_interview_stats.csv",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate a batch-level import report for SureGrad CSV data.")
    parser.add_argument("--input-dir", required=True, help="Directory containing one batch of CSV files.")
    parser.add_argument("--label", help="Optional display label for the batch.")
    parser.add_argument("--readme", help="Optional README.md path for additional batch metadata.")
    parser.add_argument("--validate-source-report", help="Optional JSON report path from validate_csv.py on source files.")
    parser.add_argument("--normalize-report", help="Optional JSON report path from normalize_text.py.")
    parser.add_argument(
        "--validate-normalized-report",
        help="Optional JSON report path from validate_csv.py on normalized files.",
    )
    parser.add_argument("--output-json", help="Optional path to write a machine-readable JSON report.")
    parser.add_argument("--output-markdown", help="Optional path to write a human-readable Markdown report.")
    return parser.parse_args()


def load_json(path_text: str | None) -> dict[str, Any] | None:
    if not path_text:
        return None

    path = Path(path_text).resolve()
    if not path.exists():
        raise FileNotFoundError(f"report file not found: {path}")

    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def load_readme(readme_path: Path | None) -> str:
    if readme_path is None or not readme_path.exists():
        return ""
    return readme_path.read_text(encoding="utf-8")


def extract_collected_at(readme_text: str) -> str | None:
    match = re.search(r"采集日期：`([^`]+)`", readme_text)
    return match.group(1) if match else None


def extract_readme_title(readme_text: str) -> str | None:
    match = re.search(r"^#\s+(.+)$", readme_text, re.MULTILINE)
    return match.group(1).strip() if match else None


def read_csv_rows(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        return [{key: (value or "").strip() for key, value in row.items()} for row in reader]


def unique_strings(values: list[str]) -> list[str]:
    return sorted({value for value in values if value})


def unique_years(rows: list[dict[str, str]]) -> list[int]:
    years: set[int] = set()
    for row in rows:
        raw = row.get("exam_year", "").strip()
        if raw.isdigit():
            years.add(int(raw))
    return sorted(years, reverse=True)


def count_by_field(rows: list[dict[str, str]], field_name: str) -> dict[str, int]:
    counter = Counter()
    for row in rows:
        value = row.get(field_name, "").strip() or "(empty)"
        counter[value] += 1
    return dict(sorted(counter.items(), key=lambda item: (-item[1], item[0])))


def build_validation_findings(report: dict[str, Any] | None, stage: str) -> list[dict[str, Any]]:
    if not report:
        return []

    findings: list[dict[str, Any]] = []
    for file_payload in report.get("files", []):
        file_name = file_payload.get("file", "")
        errors = file_payload.get("errors", [])
        warnings = file_payload.get("warnings", [])

        if errors:
            findings.append(
                {
                    "severity": "error",
                    "code": f"{stage}_errors",
                    "stage": stage,
                    "file": file_name,
                    "count": len(errors),
                    "message": f"{stage} 在 `{file_name}` 发现 {len(errors)} 个错误。",
                    "examples": errors[:3],
                }
            )

        if warnings:
            findings.append(
                {
                    "severity": "warning",
                    "code": f"{stage}_warnings",
                    "stage": stage,
                    "file": file_name,
                    "count": len(warnings),
                    "message": f"{stage} 在 `{file_name}` 发现 {len(warnings)} 个警告。",
                    "examples": warnings[:3],
                }
            )

    missing_templates = report.get("summary", {}).get("missing_templates", [])
    if missing_templates:
        findings.append(
            {
                "severity": "error",
                "code": f"{stage}_missing_templates",
                "stage": stage,
                "count": len(missing_templates),
                "message": f"{stage} 缺少 {len(missing_templates)} 个必需模板文件。",
                "examples": missing_templates[:5],
            }
        )

    if report.get("fatal_error"):
        findings.append(
            {
                "severity": "error",
                "code": f"{stage}_fatal_error",
                "stage": stage,
                "count": 1,
                "message": f"{stage} 执行失败：{report['fatal_error']}",
                "examples": [report["fatal_error"]],
            }
        )

    return findings


def build_batch_report(
    input_dir: Path,
    label: str,
    readme_path: Path | None,
    validate_source_report: dict[str, Any] | None,
    normalize_report: dict[str, Any] | None,
    validate_normalized_report: dict[str, Any] | None,
) -> dict[str, Any]:
    csv_paths = sorted(path for path in input_dir.glob("*.csv") if path.name in DATASET_SPECS)
    rows_by_file = {path.name: read_csv_rows(path) for path in csv_paths}
    present_files = [path.name for path in csv_paths]
    missing_templates = [file_name for file_name in DEFAULT_TEMPLATE_FILES if file_name not in rows_by_file]
    missing_core_templates = [file_name for file_name in CORE_TEMPLATE_FILES if file_name not in rows_by_file]

    schools_rows = rows_by_file.get("schools.csv", [])
    departments_rows = rows_by_file.get("departments.csv", [])
    programs_rows = rows_by_file.get("programs.csv", [])
    source_link_rows = rows_by_file.get("program_source_links.csv", [])

    school_names = unique_strings(
        [row.get("name", "") for row in schools_rows]
        + [row.get("school_name", "") for row in departments_rows]
        + [row.get("school_name", "") for row in programs_rows]
    )
    department_names = unique_strings(
        [row.get("department_name", "") for row in departments_rows]
        + [row.get("department_name", "") for row in programs_rows]
    )
    program_names = unique_strings([row.get("program_name", "") for row in programs_rows])

    years_by_file = {
        file_name: unique_years(rows)
        for file_name, rows in rows_by_file.items()
        if any("exam_year" in row for row in rows)
    }
    years = sorted({year for file_years in years_by_file.values() for year in file_years}, reverse=True)

    readme_text = load_readme(readme_path)
    collected_at = extract_collected_at(readme_text)

    manual_review_items: list[dict[str, Any]] = []

    if missing_core_templates:
        manual_review_items.append(
            {
                "severity": "warning",
                "code": "missing_core_templates",
                "count": len(missing_core_templates),
                "message": f"缺少 {len(missing_core_templates)} 个核心模板，当前批次还不能算完整的首轮可用学校批次。",
                "examples": missing_core_templates,
            }
        )

    missing_yearly_templates = [file_name for file_name in YEARLY_TEMPLATE_FILES if file_name not in rows_by_file]
    if missing_yearly_templates:
        manual_review_items.append(
            {
                "severity": "info",
                "code": "missing_yearly_templates",
                "count": len(missing_yearly_templates),
                "message": f"仍有 {len(missing_yearly_templates)} 个年度数据模板未录入，后续批采或人工补录时需要继续补齐。",
                "examples": missing_yearly_templates,
            }
        )

    if not readme_text:
        manual_review_items.append(
            {
                "severity": "info",
                "code": "missing_readme",
                "count": 1,
                "message": "批次目录没有 README.md，建议补充来源范围、假设和复核日期。",
                "examples": [],
            }
        )

    non_official_source_rows = [
        row
        for row in source_link_rows
        if row.get("source_confidence", "").strip() and row.get("source_confidence", "").strip() != "official"
    ]
    if non_official_source_rows:
        manual_review_items.append(
            {
                "severity": "warning",
                "code": "non_official_source_links",
                "count": len(non_official_source_rows),
                "message": f"发现 {len(non_official_source_rows)} 条非 official 来源链接，需要人工确认能否作为前台展示依据。",
                "examples": [row.get("title", "") for row in non_official_source_rows[:5]],
            }
        )

    pending_or_invalid_sources = [
        row for row in source_link_rows if row.get("status", "").strip() in {"pending", "invalid"}
    ]
    if pending_or_invalid_sources:
        manual_review_items.append(
            {
                "severity": "warning",
                "code": "unstable_source_links",
                "count": len(pending_or_invalid_sources),
                "message": f"发现 {len(pending_or_invalid_sources)} 条 pending/invalid 来源链接，需要安排二次复核。",
                "examples": [row.get("title", "") for row in pending_or_invalid_sources[:5]],
            }
        )

    for report, stage in [
        (validate_source_report, "validate_source"),
        (validate_normalized_report, "validate_normalized"),
    ]:
        manual_review_items.extend(build_validation_findings(report, stage))

    quality_gate = {
        "source_validation_ok": validate_source_report.get("ok") if validate_source_report else None,
        "normalize_ok": normalize_report.get("ok") if normalize_report else None,
        "normalized_validation_ok": validate_normalized_report.get("ok") if validate_normalized_report else None,
        "blocking_issue_count": sum(1 for item in manual_review_items if item["severity"] == "error"),
        "manual_review_item_count": len(manual_review_items),
    }

    files_payload: list[dict[str, Any]] = []
    normalize_changed_cells_by_file = {
        file_payload.get("file", ""): int(file_payload.get("changed_cells", 0))
        for file_payload in (normalize_report or {}).get("files", [])
    }

    for file_name in present_files:
        files_payload.append(
            {
                "file": file_name,
                "rows": len(rows_by_file[file_name]),
                "changed_cells": normalize_changed_cells_by_file.get(file_name, 0),
                "years": years_by_file.get(file_name, []),
            }
        )

    return {
        "tool": "generate_import_report",
        "report_version": 1,
        "generated_at": datetime.now().astimezone().isoformat(timespec="seconds"),
        "ok": quality_gate["blocking_issue_count"] == 0,
        "batch": {
            "label": label,
            "input_dir": str(input_dir),
            "readme_path": str(readme_path) if readme_path else None,
            "collected_at": collected_at,
            "present_templates": present_files,
            "missing_templates": missing_templates,
            "missing_core_templates": missing_core_templates,
            "school_names": school_names,
            "department_names": department_names,
            "program_names": program_names,
            "years": years,
        },
        "coverage": {
            file_name: len(rows_by_file.get(file_name, [])) for file_name in DEFAULT_TEMPLATE_FILES
        },
        "source_links": {
            "total": len(source_link_rows),
            "by_type": count_by_field(source_link_rows, "source_type") if source_link_rows else {},
            "by_status": count_by_field(source_link_rows, "status") if source_link_rows else {},
            "by_confidence": count_by_field(source_link_rows, "source_confidence") if source_link_rows else {},
        },
        "validation": {
            "validate_source": validate_source_report,
            "normalize": normalize_report,
            "validate_normalized": validate_normalized_report,
        },
        "quality_gate": quality_gate,
        "manual_review_items": manual_review_items,
        "files": files_payload,
    }


def write_json(path: str, payload: dict[str, Any]) -> None:
    report_path = Path(path).resolve()
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def render_markdown(payload: dict[str, Any]) -> str:
    batch = payload["batch"]
    quality_gate = payload["quality_gate"]
    lines = [
        f"# {batch['label']} 导入批次报告",
        "",
        f"- 生成时间：`{payload['generated_at']}`",
        f"- 输入目录：`{batch['input_dir']}`",
        f"- 采集日期：`{batch['collected_at'] or '未标注'}`",
        f"- 学校：{', '.join(batch['school_names']) or '未识别'}",
        f"- 年份：{' / '.join(str(year) for year in batch['years']) or '未识别'}",
        f"- 已包含模板：{len(batch['present_templates'])}",
        f"- 缺失模板：{len(batch['missing_templates'])}",
        "",
        "## 质量门禁",
        "",
        f"- source 校验通过：`{quality_gate['source_validation_ok']}`",
        f"- normalize 通过：`{quality_gate['normalize_ok']}`",
        f"- normalized 校验通过：`{quality_gate['normalized_validation_ok']}`",
        f"- 阻塞问题数：`{quality_gate['blocking_issue_count']}`",
        f"- 人工复核项：`{quality_gate['manual_review_item_count']}`",
        "",
        "## 模板覆盖",
        "",
    ]

    for file_payload in payload["files"]:
        years = file_payload["years"]
        year_text = f" 年份={' / '.join(str(year) for year in years)}" if years else ""
        lines.append(
            f"- `{file_payload['file']}`: rows={file_payload['rows']} changed_cells={file_payload['changed_cells']}{year_text}"
        )

    lines.extend(["", "## 来源链接概览", ""])
    source_links = payload["source_links"]
    lines.append(f"- 总数：{source_links['total']}")
    lines.append(f"- 按类型：{json.dumps(source_links['by_type'], ensure_ascii=False)}")
    lines.append(f"- 按状态：{json.dumps(source_links['by_status'], ensure_ascii=False)}")
    lines.append(f"- 按可信度：{json.dumps(source_links['by_confidence'], ensure_ascii=False)}")
    lines.extend(["", "## 人工复核项", ""])

    if payload["manual_review_items"]:
        for item in payload["manual_review_items"]:
            example_suffix = ""
            if item.get("examples"):
                example_suffix = f" 示例：{'; '.join(item['examples'])}"
            lines.append(f"- [{item['severity']}] {item['message']}{example_suffix}")
    else:
        lines.append("- 当前未发现人工复核项。")

    return "\n".join(lines) + "\n"


def write_markdown(path: str, payload: dict[str, Any]) -> None:
    report_path = Path(path).resolve()
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(render_markdown(payload), encoding="utf-8")


def main() -> int:
    args = parse_args()
    input_dir = Path(args.input_dir).resolve()

    if not input_dir.exists():
        print(f"ERROR: input directory not found: {input_dir}", file=sys.stderr)
        return 1

    if not input_dir.is_dir():
        print(f"ERROR: input path is not a directory: {input_dir}", file=sys.stderr)
        return 1

    readme_path = Path(args.readme).resolve() if args.readme else (input_dir / "README.md").resolve()
    if readme_path and not readme_path.exists():
        readme_path = None
    readme_text = load_readme(readme_path)
    label = args.label or extract_readme_title(readme_text) or input_dir.name

    try:
        validate_source_report = load_json(args.validate_source_report)
        normalize_report = load_json(args.normalize_report)
        validate_normalized_report = load_json(args.validate_normalized_report)
        payload = build_batch_report(
            input_dir=input_dir,
            label=label,
            readme_path=readme_path,
            validate_source_report=validate_source_report,
            normalize_report=normalize_report,
            validate_normalized_report=validate_normalized_report,
        )
    except FileNotFoundError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    if args.output_json:
        write_json(args.output_json, payload)

    if args.output_markdown:
        write_markdown(args.output_markdown, payload)

    print(
        "Summary: "
        f"templates={len(payload['batch']['present_templates'])} "
        f"missing={len(payload['batch']['missing_templates'])} "
        f"manual_review_items={payload['quality_gate']['manual_review_item_count']} "
        f"blocking_issues={payload['quality_gate']['blocking_issue_count']}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
