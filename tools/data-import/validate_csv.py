from __future__ import annotations

import argparse
import csv
import io
import json
import sys
from dataclasses import asdict, dataclass, field
from datetime import date, datetime
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Iterable
from urllib.parse import urlsplit

from csv_specs import DATASET_SPECS, DEFAULT_TEMPLATE_FILES

TRUE_VALUES = {"1", "true", "t", "yes", "y", "on", "是"}
FALSE_VALUES = {"0", "false", "f", "no", "n", "off", "否"}
DATE_FORMATS = ("%Y-%m-%d", "%Y/%m/%d", "%Y.%m.%d", "%Y年%m月%d日")
DATETIME_FORMATS = (
    "%Y-%m-%dT%H:%M:%S%z",
    "%Y-%m-%d %H:%M:%S%z",
    "%Y-%m-%dT%H:%M:%S",
    "%Y-%m-%d %H:%M:%S",
    "%Y/%m/%d %H:%M:%S",
    "%Y.%m.%d %H:%M:%S",
)
PROGRAM_DATASET_FILES = {
    "program_admissions.csv",
    "program_score_lines.csv",
    "program_application_stats.csv",
    "program_interview_stats.csv",
    "program_exam_subjects.csv",
    "program_reference_books.csv",
    "program_source_links.csv",
}
SOURCE_REQUIRED_DATASET_FILES = PROGRAM_DATASET_FILES - {"program_source_links.csv"}
ROLE_TO_SUBJECT_CATEGORY = {
    "politics": "politics",
    "english": "english",
    "math": "math",
}


@dataclass
class FileReport:
    path: Path
    rows: int = 0
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    normalized_rows: list[dict[str, str]] = field(default_factory=list)
    header_valid: bool = True


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate SureGrad import CSV files.")
    parser.add_argument("inputs", nargs="+", help="CSV files or directories containing CSV files.")
    parser.add_argument(
        "--require-all-templates",
        action="store_true",
        help="Fail if any expected template file is missing in the provided inputs.",
    )
    parser.add_argument(
        "--allow-header-reorder",
        action="store_true",
        help="Allow expected columns in a different order.",
    )
    parser.add_argument(
        "--report-file",
        help="Optional path to write a machine-readable JSON validation report.",
    )
    return parser.parse_args()


def resolve_input_files(raw_inputs: Iterable[str]) -> tuple[list[Path], list[Path]]:
    files: list[Path] = []
    directories: list[Path] = []
    seen: set[Path] = set()

    for raw in raw_inputs:
        path = Path(raw).resolve()
        if path.is_dir():
            directories.append(path)
            for candidate in sorted(path.glob("*.csv")):
                if candidate not in seen:
                    files.append(candidate)
                    seen.add(candidate)
        elif path.is_file():
            if path.suffix.lower() != ".csv":
                raise FileNotFoundError(f"Unsupported file type: {path}")
            if path not in seen:
                files.append(path)
                seen.add(path)
        else:
            raise FileNotFoundError(f"Input path not found: {path}")

    return files, directories


def decode_utf8(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8-sig")
    except UnicodeDecodeError as exc:
        raise ValueError(f"{path.name}: file must be UTF-8 or UTF-8 with BOM ({exc})") from exc


def normalize_blank(value: str | None) -> str:
    if value is None:
        return ""
    return value.strip()


def parse_int(value: str) -> int:
    if value == "":
        raise ValueError("empty value")
    try:
        decimal_value = Decimal(value)
    except InvalidOperation as exc:
        raise ValueError(f"invalid integer: {value}") from exc
    if decimal_value != decimal_value.to_integral_value():
        raise ValueError(f"integer expected, got: {value}")
    return int(decimal_value)


def parse_decimal(value: str) -> Decimal:
    if value == "":
        raise ValueError("empty value")
    try:
        return Decimal(value)
    except InvalidOperation as exc:
        raise ValueError(f"invalid decimal: {value}") from exc


def parse_bool(value: str) -> bool:
    lowered = value.lower()
    if lowered in TRUE_VALUES:
        return True
    if lowered in FALSE_VALUES:
        return False
    raise ValueError(f"invalid boolean: {value}")


def parse_date(value: str) -> date:
    for fmt in DATE_FORMATS:
        try:
            return datetime.strptime(value, fmt).date()
        except ValueError:
            continue
    raise ValueError(f"invalid date: {value}")


def parse_datetime(value: str) -> datetime:
    for fmt in DATETIME_FORMATS:
        try:
            return datetime.strptime(value, fmt)
        except ValueError:
            continue
    raise ValueError(f"invalid datetime: {value}")


def validate_url(value: str) -> None:
    parts = urlsplit(value)
    if parts.scheme not in {"http", "https"} or not parts.netloc:
        raise ValueError(f"invalid URL: {value}")


def validate_headers(
    report: FileReport,
    fieldnames: list[str],
    expected_columns: list[str],
    allow_header_reorder: bool,
) -> None:
    if allow_header_reorder:
        if set(fieldnames) != set(expected_columns):
            report.header_valid = False
            report.errors.append(
                f"{report.path.name}: header mismatch; expected columns {expected_columns}, got {fieldnames}"
            )
    elif fieldnames != expected_columns:
        report.header_valid = False
        report.errors.append(
            f"{report.path.name}: header order mismatch; expected {expected_columns}, got {fieldnames}"
        )


def validate_rows(report: FileReport, rows: list[dict[str, str]], spec: dict) -> None:
    required_fields = spec.get("required_fields", set())
    enum_fields = spec.get("enum_fields", {})
    int_fields = spec.get("int_fields", set())
    decimal_fields = spec.get("decimal_fields", set())
    bool_fields = spec.get("bool_fields", set())
    date_fields = spec.get("date_fields", set())
    datetime_fields = spec.get("datetime_fields", set())
    url_fields = spec.get("url_fields", set())
    min_values = spec.get("min_values", {})
    max_values = spec.get("max_values", {})
    unique_key_fields = spec.get("unique_key_fields")
    seen_keys: dict[tuple[str, ...], int] = {}

    for row_index, row in enumerate(rows, start=2):
        normalized_row = {key: normalize_blank(value) for key, value in row.items() if key is not None}

        if all(value == "" for value in normalized_row.values()):
            continue

        report.rows += 1
        report.normalized_rows.append(normalized_row)

        if None in row:
            report.errors.append(f"{report.path.name}:{row_index}: row has too many columns")
            continue

        for field in required_fields:
            if normalized_row.get(field, "") == "":
                report.errors.append(f"{report.path.name}:{row_index}: required field `{field}` is blank")

        for field, allowed_values in enum_fields.items():
            value = normalized_row.get(field, "")
            if value and value not in allowed_values:
                report.errors.append(
                    f"{report.path.name}:{row_index}: `{field}` must be one of {sorted(allowed_values)}, got `{value}`"
                )

        parsed_dates: dict[str, date] = {}
        parsed_datetimes: dict[str, datetime] = {}

        for field in int_fields:
            value = normalized_row.get(field, "")
            if not value:
                continue
            try:
                parsed = parse_int(value)
            except ValueError as exc:
                report.errors.append(f"{report.path.name}:{row_index}: `{field}` {exc}")
                continue
            if field in min_values and parsed < min_values[field]:
                report.errors.append(
                    f"{report.path.name}:{row_index}: `{field}` must be >= {min_values[field]}, got {parsed}"
                )
            if field in max_values and parsed > max_values[field]:
                report.errors.append(
                    f"{report.path.name}:{row_index}: `{field}` must be <= {max_values[field]}, got {parsed}"
                )

        for field in decimal_fields:
            value = normalized_row.get(field, "")
            if not value:
                continue
            try:
                parsed = parse_decimal(value)
            except ValueError as exc:
                report.errors.append(f"{report.path.name}:{row_index}: `{field}` {exc}")
                continue
            if field in min_values and parsed < Decimal(str(min_values[field])):
                report.errors.append(
                    f"{report.path.name}:{row_index}: `{field}` must be >= {min_values[field]}, got {parsed}"
                )
            if field in max_values and parsed > Decimal(str(max_values[field])):
                report.errors.append(
                    f"{report.path.name}:{row_index}: `{field}` must be <= {max_values[field]}, got {parsed}"
                )

        for field in bool_fields:
            value = normalized_row.get(field, "")
            if not value:
                continue
            try:
                parse_bool(value)
            except ValueError as exc:
                report.errors.append(f"{report.path.name}:{row_index}: `{field}` {exc}")

        for field in date_fields:
            value = normalized_row.get(field, "")
            if not value:
                continue
            try:
                parsed_dates[field] = parse_date(value)
            except ValueError as exc:
                report.errors.append(f"{report.path.name}:{row_index}: `{field}` {exc}")

        for field in datetime_fields:
            value = normalized_row.get(field, "")
            if not value:
                continue
            try:
                parsed_datetimes[field] = parse_datetime(value)
            except ValueError as exc:
                report.errors.append(f"{report.path.name}:{row_index}: `{field}` {exc}")

        for field in url_fields:
            value = normalized_row.get(field, "")
            if not value:
                continue
            try:
                validate_url(value)
            except ValueError as exc:
                report.errors.append(f"{report.path.name}:{row_index}: `{field}` {exc}")

        if report.path.name == "program_source_links.csv":
            validate_program_source_link_row(report, row_index, normalized_row, parsed_dates, parsed_datetimes)

        if unique_key_fields:
            key = tuple(normalized_row.get(field, "") for field in unique_key_fields)
            if any(part != "" for part in key):
                if key in seen_keys:
                    first_row = seen_keys[key]
                    report.errors.append(
                        f"{report.path.name}:{row_index}: duplicate key {unique_key_fields} also seen on row {first_row}"
                    )
                else:
                    seen_keys[key] = row_index

        add_sanity_warnings(report, row_index, normalized_row)


def validate_program_source_link_row(
    report: FileReport,
    row_index: int,
    row: dict[str, str],
    parsed_dates: dict[str, date],
    parsed_datetimes: dict[str, datetime],
) -> None:
    published_at = parsed_dates.get("published_at")
    last_verified_at = parsed_datetimes.get("last_verified_at")
    status = row.get("status", "")
    notes = row.get("notes", "")

    if published_at and last_verified_at and published_at > last_verified_at.date():
        report.errors.append(
            f"{report.path.name}:{row_index}: `published_at` cannot be later than `last_verified_at`"
        )

    if status == "invalid" and notes == "":
        report.errors.append(
            f"{report.path.name}:{row_index}: `notes` is required when `status` is `invalid`"
        )


def add_sanity_warnings(report: FileReport, row_index: int, row: dict[str, str]) -> None:
    if {"applicant_count", "admitted_count", "application_ratio"} <= row.keys():
        applicant_count = row.get("applicant_count", "")
        admitted_count = row.get("admitted_count", "")
        application_ratio = row.get("application_ratio", "")
        if applicant_count and admitted_count and application_ratio:
            try:
                applicant_value = Decimal(parse_int(applicant_count))
                admitted_value = Decimal(parse_int(admitted_count))
                ratio_value = parse_decimal(application_ratio)
                if admitted_value > 0:
                    expected = (applicant_value / admitted_value).quantize(Decimal("0.01"))
                    if abs(expected - ratio_value) > Decimal("0.05"):
                        report.warnings.append(
                            f"{report.path.name}:{row_index}: application_ratio {ratio_value} differs from applicant_count/admitted_count {expected}"
                        )
            except ValueError:
                pass

    if {"retest_candidate_count", "final_admitted_count", "interview_ratio"} <= row.keys():
        retest_count = row.get("retest_candidate_count", "")
        admitted_count = row.get("final_admitted_count", "")
        interview_ratio = row.get("interview_ratio", "")
        if retest_count and admitted_count and interview_ratio:
            try:
                retest_value = Decimal(parse_int(retest_count))
                admitted_value = Decimal(parse_int(admitted_count))
                ratio_value = parse_decimal(interview_ratio)
                if admitted_value > 0:
                    expected = (retest_value / admitted_value).quantize(Decimal("0.01"))
                    if abs(expected - ratio_value) > Decimal("0.05"):
                        report.warnings.append(
                            f"{report.path.name}:{row_index}: interview_ratio {ratio_value} differs from retest_candidate_count/final_admitted_count {expected}"
                        )
            except ValueError:
                pass

    if {"retest_weight", "initial_exam_weight"} <= row.keys():
        retest_weight = row.get("retest_weight", "")
        initial_weight = row.get("initial_exam_weight", "")
        if retest_weight and initial_weight:
            try:
                total = parse_decimal(retest_weight) + parse_decimal(initial_weight)
                if total != Decimal("100"):
                    report.warnings.append(
                        f"{report.path.name}:{row_index}: retest_weight + initial_exam_weight should usually equal 100, got {total}"
                    )
            except ValueError:
                pass


def validate_file(path: Path, allow_header_reorder: bool) -> FileReport:
    report = FileReport(path=path)
    spec = DATASET_SPECS.get(path.name)
    if spec is None:
        report.errors.append(f"{path.name}: unknown CSV template")
        return report

    try:
        content = decode_utf8(path)
    except ValueError as exc:
        report.errors.append(str(exc))
        return report

    reader = csv.DictReader(io.StringIO(content))
    fieldnames = reader.fieldnames or []
    validate_headers(report, fieldnames, spec["columns"], allow_header_reorder)

    rows = list(reader)
    validate_rows(report, rows, spec)
    return report


def validate_required_templates(directories: list[Path], files: list[Path]) -> list[str]:
    missing: list[str] = []
    available = set()
    for directory in directories:
        available.update(path.name for path in directory.glob("*.csv"))
    available.update(path.name for path in files)
    for filename in DEFAULT_TEMPLATE_FILES:
        if filename not in available:
            missing.append(filename)
    return missing


def row_ref(filename: str, row_index: int, row: dict[str, str]) -> str:
    summary_fields = ["school_name", "department_name", "program_code", "exam_year", "source_type", "subject_role"]
    details = ", ".join(f"{field}={row[field]}" for field in summary_fields if row.get(field))
    if details:
        return f"{filename}:{row_index} ({details})"
    return f"{filename}:{row_index}"


def build_index(rows: list[dict[str, str]], key_fields: tuple[str, ...]) -> dict[tuple[str, ...], tuple[int, dict[str, str]]]:
    index: dict[tuple[str, ...], tuple[int, dict[str, str]]] = {}
    for row_index, row in enumerate(rows, start=2):
        key = tuple(row.get(field, "") for field in key_fields)
        if any(part != "" for part in key) and key not in index:
            index[key] = (row_index, row)
    return index


def dataset_has_blocking_errors(reports_by_name: dict[str, FileReport], filename: str) -> bool:
    report = reports_by_name.get(filename)
    return report is None or not report.header_valid


def validate_cross_file_relationships(reports: list[FileReport]) -> None:
    reports_by_name = {report.path.name: report for report in reports}

    school_report = reports_by_name.get("schools.csv")
    department_report = reports_by_name.get("departments.csv")
    program_report = reports_by_name.get("programs.csv")
    subject_report = reports_by_name.get("subjects.csv")
    book_report = reports_by_name.get("books.csv")
    exam_subject_report = reports_by_name.get("program_exam_subjects.csv")
    source_link_report = reports_by_name.get("program_source_links.csv")

    schools_by_name = build_index(school_report.normalized_rows, ("name",)) if school_report else {}
    schools_by_name_code = (
        build_index(school_report.normalized_rows, ("name", "code")) if school_report else {}
    )
    departments_by_school_and_name = (
        build_index(department_report.normalized_rows, ("school_name", "department_name")) if department_report else {}
    )
    programs_by_key = (
        build_index(
            program_report.normalized_rows,
            ("school_name", "department_name", "program_code", "research_direction"),
        )
        if program_report
        else {}
    )
    subjects_by_code = build_index(subject_report.normalized_rows, ("code",)) if subject_report else {}
    subjects_by_name = build_index(subject_report.normalized_rows, ("name",)) if subject_report else {}
    books_by_key = (
        build_index(book_report.normalized_rows, ("title", "author", "publisher", "isbn")) if book_report else {}
    )
    books_by_key_without_isbn = (
        build_index(book_report.normalized_rows, ("title", "author", "publisher")) if book_report else {}
    )
    exam_subjects_by_program_year_role = (
        build_index(
            exam_subject_report.normalized_rows,
            ("school_name", "department_name", "program_code", "research_direction", "exam_year", "subject_role"),
        )
        if exam_subject_report
        else {}
    )
    source_links_by_program_year = (
        build_index(
            source_link_report.normalized_rows,
            ("school_name", "department_name", "program_code", "research_direction", "exam_year"),
        )
        if source_link_report
        else {}
    )

    if department_report and not dataset_has_blocking_errors(reports_by_name, "schools.csv"):
        for row_index, row in enumerate(department_report.normalized_rows, start=2):
            key = (row.get("school_name", ""), row.get("school_code", ""))
            name = row.get("school_name", "")
            if key[1]:
                if key not in schools_by_name_code:
                    department_report.errors.append(
                        f"{row_ref('departments.csv', row_index, row)}: school `{key[0]}` with code `{key[1]}` not found in schools.csv"
                    )
            elif (name,) not in schools_by_name:
                department_report.errors.append(
                    f"{row_ref('departments.csv', row_index, row)}: school `{name}` not found in schools.csv"
                )

    if program_report and not (
        dataset_has_blocking_errors(reports_by_name, "schools.csv")
        or dataset_has_blocking_errors(reports_by_name, "departments.csv")
    ):
        for row_index, row in enumerate(program_report.normalized_rows, start=2):
            school_name = row.get("school_name", "")
            department_name = row.get("department_name", "")
            if (school_name,) not in schools_by_name:
                program_report.errors.append(
                    f"{row_ref('programs.csv', row_index, row)}: school `{school_name}` not found in schools.csv"
                )
            if (school_name, department_name) not in departments_by_school_and_name:
                program_report.errors.append(
                    f"{row_ref('programs.csv', row_index, row)}: department `{department_name}` not found for school `{school_name}`"
                )

    if subject_report and exam_subject_report and not dataset_has_blocking_errors(reports_by_name, "subjects.csv"):
        for row_index, row in enumerate(exam_subject_report.normalized_rows, start=2):
            subject_code = row.get("subject_code", "")
            subject_name = row.get("subject_name_text", "")
            subject_role = row.get("subject_role", "")
            matched_row: dict[str, str] | None = None

            if subject_code:
                matched = subjects_by_code.get((subject_code,))
                if matched is None:
                    exam_subject_report.errors.append(
                        f"{row_ref('program_exam_subjects.csv', row_index, row)}: subject_code `{subject_code}` not found in subjects.csv"
                    )
                    continue
                matched_row = matched[1]
            else:
                matched = subjects_by_name.get((subject_name,))
                if matched is None:
                    exam_subject_report.errors.append(
                        f"{row_ref('program_exam_subjects.csv', row_index, row)}: subject_name_text `{subject_name}` not found in subjects.csv"
                    )
                    continue
                matched_row = matched[1]

            canonical_name = matched_row.get("name", "")
            if subject_name and subject_name != canonical_name:
                exam_subject_report.warnings.append(
                    f"{row_ref('program_exam_subjects.csv', row_index, row)}: subject_name_text `{subject_name}` maps to canonical subject `{canonical_name}`"
                )

            expected_category = ROLE_TO_SUBJECT_CATEGORY.get(subject_role)
            actual_category = matched_row.get("category", "")
            if expected_category and actual_category != expected_category:
                exam_subject_report.errors.append(
                    f"{row_ref('program_exam_subjects.csv', row_index, row)}: subject_role `{subject_role}` expects category `{expected_category}`, got `{actual_category}`"
                )

    if book_report and exam_subject_report and not dataset_has_blocking_errors(reports_by_name, "books.csv"):
        reference_report = reports_by_name.get("program_reference_books.csv")
        if reference_report:
            for row_index, row in enumerate(reference_report.normalized_rows, start=2):
                key = (
                    row.get("book_title", ""),
                    row.get("book_author", ""),
                    row.get("book_publisher", ""),
                    row.get("book_isbn", ""),
                )
                short_key = key[:3]
                matched = books_by_key.get(key)
                if matched is None and key[3] == "":
                    matched = books_by_key_without_isbn.get(short_key)
                if matched is None:
                    reference_report.errors.append(
                        f"{row_ref('program_reference_books.csv', row_index, row)}: book `{row.get('book_title', '')}` not found in books.csv"
                    )
                subject_key = (
                    row.get("school_name", ""),
                    row.get("department_name", ""),
                    row.get("program_code", ""),
                    row.get("research_direction", ""),
                    row.get("exam_year", ""),
                    row.get("subject_role", ""),
                )
                if not dataset_has_blocking_errors(reports_by_name, "program_exam_subjects.csv"):
                    if subject_key not in exam_subjects_by_program_year_role:
                        reference_report.errors.append(
                            f"{row_ref('program_reference_books.csv', row_index, row)}: subject_role `{row.get('subject_role', '')}` has no matching row in program_exam_subjects.csv for the same program/year"
                        )

    if not dataset_has_blocking_errors(reports_by_name, "programs.csv"):
        for filename in PROGRAM_DATASET_FILES:
            report = reports_by_name.get(filename)
            if report is None:
                continue
            for row_index, row in enumerate(report.normalized_rows, start=2):
                program_key = (
                    row.get("school_name", ""),
                    row.get("department_name", ""),
                    row.get("program_code", ""),
                    row.get("research_direction", ""),
                )
                matched_program = programs_by_key.get(program_key)
                if matched_program is None:
                    report.errors.append(
                        f"{row_ref(filename, row_index, row)}: program key {program_key} not found in programs.csv"
                    )
                    continue
                program_name = row.get("program_name", "")
                if program_name and matched_program[1].get("program_name", "") != program_name:
                    report.errors.append(
                        f"{row_ref(filename, row_index, row)}: program_name `{program_name}` does not match programs.csv `{matched_program[1].get('program_name', '')}`"
                    )

    if not dataset_has_blocking_errors(reports_by_name, "program_source_links.csv"):
        for filename in SOURCE_REQUIRED_DATASET_FILES:
            report = reports_by_name.get(filename)
            if report is None:
                continue
            for row_index, row in enumerate(report.normalized_rows, start=2):
                program_year_key = (
                    row.get("school_name", ""),
                    row.get("department_name", ""),
                    row.get("program_code", ""),
                    row.get("research_direction", ""),
                    row.get("exam_year", ""),
                )
                if program_year_key not in source_links_by_program_year:
                    report.errors.append(
                        f"{row_ref(filename, row_index, row)}: no matching source link found in program_source_links.csv for the same program/year"
                    )


def build_report_payload(
    reports: list[FileReport],
    missing_templates: list[str],
    exit_code: int,
) -> dict:
    error_count = sum(len(report.errors) for report in reports) + len(missing_templates)
    warning_count = sum(len(report.warnings) for report in reports)
    total_rows = sum(report.rows for report in reports)
    return {
        "tool": "validate_csv",
        "ok": exit_code == 0,
        "exit_code": exit_code,
        "summary": {
            "files": len(reports),
            "rows": total_rows,
            "errors": error_count,
            "warnings": warning_count,
            "missing_templates": missing_templates,
        },
        "files": [
            {
                "file": report.path.name,
                "rows": report.rows,
                "errors": report.errors,
                "warnings": report.warnings,
            }
            for report in reports
        ],
    }


def write_report(report_file: str, payload: dict) -> None:
    path = Path(report_file).resolve()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> int:
    args = parse_args()

    try:
        files, directories = resolve_input_files(args.inputs)
    except FileNotFoundError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        payload = {
            "tool": "validate_csv",
            "ok": False,
            "exit_code": 1,
            "summary": {"files": 0, "rows": 0, "errors": 1, "warnings": 0, "missing_templates": []},
            "files": [],
            "fatal_error": str(exc),
        }
        if args.report_file:
            write_report(args.report_file, payload)
        return 1

    if not files:
        print("ERROR: no CSV files found", file=sys.stderr)
        payload = {
            "tool": "validate_csv",
            "ok": False,
            "exit_code": 1,
            "summary": {"files": 0, "rows": 0, "errors": 1, "warnings": 0, "missing_templates": []},
            "files": [],
            "fatal_error": "no CSV files found",
        }
        if args.report_file:
            write_report(args.report_file, payload)
        return 1

    reports = [validate_file(path, args.allow_header_reorder) for path in files]
    validate_cross_file_relationships(reports)

    missing_templates: list[str] = []
    if args.require_all_templates:
        missing_templates = validate_required_templates(directories, files)
        for filename in missing_templates:
            print(f"ERROR: missing required template file `{filename}`", file=sys.stderr)

    error_count = len(missing_templates)
    warning_count = 0

    for report in reports:
        if report.errors:
            for error in report.errors:
                print(f"ERROR: {error}", file=sys.stderr)
            error_count += len(report.errors)
        if report.warnings:
            for warning in report.warnings:
                print(f"WARNING: {warning}")
            warning_count += len(report.warnings)
        print(f"OK: {report.path.name} rows={report.rows} errors={len(report.errors)} warnings={len(report.warnings)}")

    print(
        f"Summary: files={len(reports)} rows={sum(report.rows for report in reports)} errors={error_count} warnings={warning_count}"
    )
    exit_code = 1 if error_count else 0

    if args.report_file:
        payload = build_report_payload(reports, missing_templates, exit_code)
        write_report(args.report_file, payload)

    return exit_code


if __name__ == "__main__":
    sys.exit(main())
