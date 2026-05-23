from __future__ import annotations

import argparse
import csv
import json
import sys
from dataclasses import dataclass, field
from datetime import date, datetime
from pathlib import Path
from typing import Any

from db import (
    DatabaseSettings,
    connect,
    empty_to_none,
    normalize_research_direction,
    parse_bool,
    resolve_database_settings,
)

IMPORT_ORDER = (
    "schools.csv",
    "departments.csv",
    "programs.csv",
    "subjects.csv",
    "program_admissions.csv",
    "program_score_lines.csv",
    "program_application_stats.csv",
    "program_interview_stats.csv",
    "program_exam_subjects.csv",
    "program_source_links.csv",
)


@dataclass
class LookupTables:
    schools: dict[tuple[str, str], str] = field(default_factory=dict)
    schools_by_code: dict[str, str] = field(default_factory=dict)
    departments: dict[tuple[str, str], str] = field(default_factory=dict)
    programs: dict[tuple[str, str, str, str | None], str] = field(default_factory=dict)
    subjects_by_code: dict[str, str] = field(default_factory=dict)

    def school_key(self, name: str, city: str) -> tuple[str, str]:
        return (name.strip(), city.strip())

    def department_key(self, school_name: str, department_name: str) -> tuple[str, str]:
        return (school_name.strip(), department_name.strip())

    def program_key(
        self,
        school_name: str,
        department_name: str,
        program_code: str,
        research_direction: str | None,
    ) -> tuple[str, str, str, str | None]:
        return (
            school_name.strip(),
            department_name.strip(),
            program_code.strip(),
            normalize_research_direction(research_direction),
        )


def load_config(path: Path) -> dict[str, Any]:
    raw = path.read_text(encoding="utf-8")
    return json.loads(raw)


def resolve_input_dir(config_path: Path, config: dict[str, Any]) -> Path:
    base = config_path.parent
    value = config["input_dir"]
    input_dir = Path(value) if Path(value).is_absolute() else (base / value)
    return input_dir.resolve()


def read_csv_rows(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        return [dict(row) for row in reader]


def parse_optional_date(value: str | None) -> date | None:
    text = empty_to_none(value)
    if text is None:
        return None
    return date.fromisoformat(text)


def parse_timestamptz(value: str | None) -> datetime:
    text = (value or "").strip()
    if not text:
        raise ValueError("last_verified_at is required for program_source_links")
    normalized = text.replace("Z", "+00:00")
    return datetime.fromisoformat(normalized)


def find_school_id(conn: Any, lookup: LookupTables, name: str, city: str, code: str | None) -> str | None:
    if code and code in lookup.schools_by_code:
        return lookup.schools_by_code[code]

    key = lookup.school_key(name, city)
    if key in lookup.schools:
        return lookup.schools[key]

    if code:
        row = conn.execute(
            """
            SELECT id FROM schools
            WHERE code = %s AND deleted_at IS NULL
            LIMIT 1
            """,
            (code,),
        ).fetchone()
        if row:
            return str(row["id"])

    row = conn.execute(
        """
        SELECT id FROM schools
        WHERE name = %s AND city = %s AND deleted_at IS NULL
        LIMIT 1
        """,
        (name, city),
    ).fetchone()
    return str(row["id"]) if row else None


def upsert_school(conn: Any, lookup: LookupTables, row: dict[str, str]) -> str:
    name = row["name"].strip()
    city = row["city"].strip()
    code = empty_to_none(row.get("code"))
    existing_id = find_school_id(conn, lookup, name, city, code)

    values = {
        "name": name,
        "short_name": row["short_name"].strip(),
        "code": code,
        "province": row["province"].strip(),
        "city": city,
        "school_type": row["school_type"].strip(),
        "school_level": row["school_level"].strip(),
        "has_graduate_school": parse_bool(row.get("has_graduate_school")),
        "official_website": empty_to_none(row.get("official_website")),
        "graduate_website": empty_to_none(row.get("graduate_website")),
        "description": empty_to_none(row.get("description")),
        "sort_order": int(row.get("sort_order") or 0),
        "status": row.get("status", "active").strip() or "active",
    }

    if existing_id:
        conn.execute(
            """
            UPDATE schools SET
                name = %(name)s,
                short_name = %(short_name)s,
                code = %(code)s,
                province = %(province)s,
                city = %(city)s,
                school_type = %(school_type)s,
                school_level = %(school_level)s,
                has_graduate_school = %(has_graduate_school)s,
                official_website = %(official_website)s,
                graduate_website = %(graduate_website)s,
                description = %(description)s,
                sort_order = %(sort_order)s,
                status = %(status)s,
                updated_at = NOW(),
                deleted_at = NULL
            WHERE id = %(id)s
            """,
            {**values, "id": existing_id},
        )
        school_id = existing_id
    else:
        inserted = conn.execute(
            """
            INSERT INTO schools (
                name, short_name, code, province, city, school_type, school_level,
                has_graduate_school, official_website, graduate_website, description,
                sort_order, status
            ) VALUES (
                %(name)s, %(short_name)s, %(code)s, %(province)s, %(city)s,
                %(school_type)s, %(school_level)s, %(has_graduate_school)s,
                %(official_website)s, %(graduate_website)s, %(description)s,
                %(sort_order)s, %(status)s
            )
            RETURNING id
            """,
            values,
        ).fetchone()
        school_id = str(inserted["id"])

    lookup.schools[lookup.school_key(name, city)] = school_id
    if code:
        lookup.schools_by_code[code] = school_id
    return school_id


def resolve_school_id_from_row(conn: Any, lookup: LookupTables, row: dict[str, str]) -> str:
    school_name = row["school_name"].strip()
    school_code = empty_to_none(row.get("school_code"))

    if school_code and school_code in lookup.schools_by_code:
        return lookup.schools_by_code[school_code]

    for (name, _city), school_id in lookup.schools.items():
        if name == school_name:
            return school_id

    if school_code:
        row_db = conn.execute(
            """
            SELECT id FROM schools
            WHERE code = %s AND deleted_at IS NULL
            LIMIT 1
            """,
            (school_code,),
        ).fetchone()
        if row_db:
            return str(row_db["id"])

    row_db = conn.execute(
        """
        SELECT id, city FROM schools
        WHERE name = %s AND deleted_at IS NULL
        LIMIT 1
        """,
        (school_name,),
    ).fetchone()
    if not row_db:
        raise KeyError(f"School not found for import row: {school_name}")
    school_id = str(row_db["id"])
    lookup.schools[lookup.school_key(school_name, str(row_db["city"]))] = school_id
    if school_code:
        lookup.schools_by_code[school_code] = school_id
    return school_id


def upsert_department(conn: Any, lookup: LookupTables, row: dict[str, str]) -> str:
    school_id = resolve_school_id_from_row(conn, lookup, row)
    school_name = row["school_name"].strip()
    department_name = row["department_name"].strip()
    dept_key = lookup.department_key(school_name, department_name)

    if dept_key in lookup.departments:
        department_id = lookup.departments[dept_key]
        conn.execute(
            """
            UPDATE departments SET
                code = %(code)s,
                website = %(website)s,
                status = %(status)s,
                updated_at = NOW(),
                deleted_at = NULL
            WHERE id = %(id)s
            """,
            {
                "id": department_id,
                "code": empty_to_none(row.get("department_code")),
                "website": empty_to_none(row.get("website")),
                "status": row.get("status", "active").strip() or "active",
            },
        )
        return department_id

    existing = conn.execute(
        """
        SELECT id FROM departments
        WHERE school_id = %s AND name = %s AND deleted_at IS NULL
        LIMIT 1
        """,
        (school_id, department_name),
    ).fetchone()

    values = {
        "school_id": school_id,
        "name": department_name,
        "code": empty_to_none(row.get("department_code")),
        "website": empty_to_none(row.get("website")),
        "status": row.get("status", "active").strip() or "active",
    }

    if existing:
        department_id = str(existing["id"])
        conn.execute(
            """
            UPDATE departments SET
                code = %(code)s,
                website = %(website)s,
                status = %(status)s,
                updated_at = NOW(),
                deleted_at = NULL
            WHERE id = %(id)s
            """,
            {**values, "id": department_id},
        )
    else:
        inserted = conn.execute(
            """
            INSERT INTO departments (school_id, name, code, website, status)
            VALUES (%(school_id)s, %(name)s, %(code)s, %(website)s, %(status)s)
            RETURNING id
            """,
            values,
        ).fetchone()
        department_id = str(inserted["id"])

    lookup.departments[dept_key] = department_id
    return department_id


def resolve_program_id(conn: Any, lookup: LookupTables, row: dict[str, str]) -> str:
    school_name = row["school_name"].strip()
    department_name = row["department_name"].strip()
    program_code = row["program_code"].strip()
    research_direction = normalize_research_direction(row.get("research_direction"))
    prog_key = lookup.program_key(school_name, department_name, program_code, research_direction)

    if prog_key in lookup.programs:
        return lookup.programs[prog_key]

    school_id = resolve_school_id_from_row(conn, lookup, row)
    department_id = lookup.departments.get(lookup.department_key(school_name, department_name))
    if not department_id:
        department_id = upsert_department(
            conn,
            lookup,
            {
                "school_name": school_name,
                "school_code": row.get("school_code", ""),
                "department_name": department_name,
                "department_code": "",
                "website": "",
                "status": "active",
            },
        )

    existing = conn.execute(
        """
        SELECT id FROM programs
        WHERE school_id = %s
          AND department_id = %s
          AND code = %s
          AND COALESCE(research_direction, '') = COALESCE(%s::varchar, '')
          AND deleted_at IS NULL
        LIMIT 1
        """,
        (school_id, department_id, program_code, research_direction),
    ).fetchone()

    if existing:
        program_id = str(existing["id"])
    else:
        raise KeyError(
            f"Program not found for ({school_name}, {department_name}, {program_code}); "
            "import programs.csv before yearly tables."
        )

    lookup.programs[prog_key] = program_id
    return program_id


def upsert_program(conn: Any, lookup: LookupTables, row: dict[str, str]) -> str:
    school_id = resolve_school_id_from_row(conn, lookup, row)
    school_name = row["school_name"].strip()
    department_name = row["department_name"].strip()
    program_code = row["program_code"].strip()
    research_direction = normalize_research_direction(row.get("research_direction"))
    department_id = upsert_department(
        conn,
        lookup,
        {
            "school_name": school_name,
            "school_code": row.get("school_code", ""),
            "department_name": department_name,
            "department_code": row.get("department_code", ""),
            "website": "",
            "status": "active",
        },
    )

    prog_key = lookup.program_key(school_name, department_name, program_code, research_direction)
    values = {
        "school_id": school_id,
        "department_id": department_id,
        "name": row["program_name"].strip(),
        "code": program_code,
        "degree_type": row["degree_type"].strip(),
        "discipline_category": row["discipline_category"].strip(),
        "research_direction": research_direction,
        "exam_math_required": parse_bool(row.get("exam_math_required")),
        "duration_years": float(row["duration_years"]),
        "tuition_per_year": float(row["tuition_per_year"]),
        "notes": empty_to_none(row.get("notes")),
        "status": row.get("status", "active").strip() or "active",
    }

    existing = conn.execute(
        """
        SELECT id FROM programs
        WHERE school_id = %s
          AND department_id = %s
          AND code = %s
          AND COALESCE(research_direction, '') = COALESCE(%s::varchar, '')
          AND deleted_at IS NULL
        LIMIT 1
        """,
        (school_id, department_id, program_code, research_direction),
    ).fetchone()

    if existing:
        program_id = str(existing["id"])
        conn.execute(
            """
            UPDATE programs SET
                name = %(name)s,
                degree_type = %(degree_type)s,
                discipline_category = %(discipline_category)s,
                research_direction = %(research_direction)s,
                exam_math_required = %(exam_math_required)s,
                duration_years = %(duration_years)s,
                tuition_per_year = %(tuition_per_year)s,
                notes = %(notes)s,
                status = %(status)s,
                updated_at = NOW(),
                deleted_at = NULL
            WHERE id = %(id)s
            """,
            {**values, "id": program_id},
        )
    else:
        inserted = conn.execute(
            """
            INSERT INTO programs (
                school_id, department_id, name, code, degree_type, discipline_category,
                research_direction, exam_math_required, duration_years, tuition_per_year,
                notes, status
            ) VALUES (
                %(school_id)s, %(department_id)s, %(name)s, %(code)s, %(degree_type)s,
                %(discipline_category)s, %(research_direction)s, %(exam_math_required)s,
                %(duration_years)s, %(tuition_per_year)s, %(notes)s, %(status)s
            )
            RETURNING id
            """,
            values,
        ).fetchone()
        program_id = str(inserted["id"])

    lookup.programs[prog_key] = program_id
    return program_id


def parse_optional_int(value: str | None) -> int | None:
    text = empty_to_none(value)
    if text is None:
        return None
    return int(text)


def parse_decimal(value: str | None) -> float:
    text = (value or "").strip()
    if not text:
        raise ValueError("decimal value is required")
    return float(text)


def upsert_admission(conn: Any, lookup: LookupTables, row: dict[str, str]) -> None:
    program_id = resolve_program_id(conn, lookup, row)
    values = {
        "program_id": program_id,
        "exam_year": int(row["exam_year"]),
        "planned_enrollment": int(row["planned_enrollment"]),
        "recommended_exemption_count": int(row.get("recommended_exemption_count") or 0),
        "unified_exam_quota": int(row.get("unified_exam_quota") or 0),
        "actual_enrollment": parse_optional_int(row.get("actual_enrollment")),
        "is_cross_major_allowed": parse_bool(row.get("is_cross_major_allowed")),
        "memo": empty_to_none(row.get("memo")),
        "source_confidence": row["source_confidence"].strip(),
    }
    conn.execute(
        """
        INSERT INTO program_admissions (
            program_id, exam_year, planned_enrollment, recommended_exemption_count,
            unified_exam_quota, actual_enrollment, is_cross_major_allowed, memo,
            source_confidence
        ) VALUES (
            %(program_id)s, %(exam_year)s, %(planned_enrollment)s,
            %(recommended_exemption_count)s, %(unified_exam_quota)s, %(actual_enrollment)s,
            %(is_cross_major_allowed)s, %(memo)s, %(source_confidence)s
        )
        ON CONFLICT (program_id, exam_year)
        DO UPDATE SET
            planned_enrollment = EXCLUDED.planned_enrollment,
            recommended_exemption_count = EXCLUDED.recommended_exemption_count,
            unified_exam_quota = EXCLUDED.unified_exam_quota,
            actual_enrollment = EXCLUDED.actual_enrollment,
            is_cross_major_allowed = EXCLUDED.is_cross_major_allowed,
            memo = EXCLUDED.memo,
            source_confidence = EXCLUDED.source_confidence,
            updated_at = NOW()
        """,
        values,
    )


def upsert_score_line(conn: Any, lookup: LookupTables, row: dict[str, str]) -> None:
    program_id = resolve_program_id(conn, lookup, row)
    values = {
        "program_id": program_id,
        "exam_year": int(row["exam_year"]),
        "total_score": int(row["total_score"]),
        "politics_score": int(row["politics_score"]),
        "english_score": int(row["english_score"]),
        "subject_one_score": int(row["subject_one_score"]),
        "subject_two_score": int(row["subject_two_score"]),
        "score_line_type": row["score_line_type"].strip(),
        "notes": empty_to_none(row.get("notes")),
        "source_confidence": row["source_confidence"].strip(),
    }
    conn.execute(
        """
        INSERT INTO program_score_lines (
            program_id, exam_year, total_score, politics_score, english_score,
            subject_one_score, subject_two_score, score_line_type, notes, source_confidence
        ) VALUES (
            %(program_id)s, %(exam_year)s, %(total_score)s, %(politics_score)s, %(english_score)s,
            %(subject_one_score)s, %(subject_two_score)s, %(score_line_type)s, %(notes)s,
            %(source_confidence)s
        )
        ON CONFLICT (program_id, exam_year, score_line_type)
        DO UPDATE SET
            total_score = EXCLUDED.total_score,
            politics_score = EXCLUDED.politics_score,
            english_score = EXCLUDED.english_score,
            subject_one_score = EXCLUDED.subject_one_score,
            subject_two_score = EXCLUDED.subject_two_score,
            notes = EXCLUDED.notes,
            source_confidence = EXCLUDED.source_confidence,
            updated_at = NOW()
        """,
        values,
    )


def upsert_application_stat(conn: Any, lookup: LookupTables, row: dict[str, str]) -> None:
    program_id = resolve_program_id(conn, lookup, row)
    values = {
        "program_id": program_id,
        "exam_year": int(row["exam_year"]),
        "applicant_count": int(row["applicant_count"]),
        "actual_exam_count": parse_optional_int(row.get("actual_exam_count")),
        "admitted_count": int(row["admitted_count"]),
        "application_ratio": parse_decimal(row.get("application_ratio")),
        "notes": empty_to_none(row.get("notes")),
        "source_confidence": row["source_confidence"].strip(),
    }
    conn.execute(
        """
        INSERT INTO program_application_stats (
            program_id, exam_year, applicant_count, actual_exam_count, admitted_count,
            application_ratio, notes, source_confidence
        ) VALUES (
            %(program_id)s, %(exam_year)s, %(applicant_count)s, %(actual_exam_count)s,
            %(admitted_count)s, %(application_ratio)s, %(notes)s, %(source_confidence)s
        )
        ON CONFLICT (program_id, exam_year)
        DO UPDATE SET
            applicant_count = EXCLUDED.applicant_count,
            actual_exam_count = EXCLUDED.actual_exam_count,
            admitted_count = EXCLUDED.admitted_count,
            application_ratio = EXCLUDED.application_ratio,
            notes = EXCLUDED.notes,
            source_confidence = EXCLUDED.source_confidence,
            updated_at = NOW()
        """,
        values,
    )


def upsert_interview_stat(conn: Any, lookup: LookupTables, row: dict[str, str]) -> None:
    program_id = resolve_program_id(conn, lookup, row)
    values = {
        "program_id": program_id,
        "exam_year": int(row["exam_year"]),
        "retest_candidate_count": int(row["retest_candidate_count"]),
        "final_admitted_count": int(row["final_admitted_count"]),
        "interview_ratio": parse_decimal(row.get("interview_ratio")),
        "retest_weight": parse_decimal(row.get("retest_weight")),
        "initial_exam_weight": parse_decimal(row.get("initial_exam_weight")),
        "notes": empty_to_none(row.get("notes")),
        "source_confidence": row["source_confidence"].strip(),
    }
    conn.execute(
        """
        INSERT INTO program_interview_stats (
            program_id, exam_year, retest_candidate_count, final_admitted_count,
            interview_ratio, retest_weight, initial_exam_weight, notes, source_confidence
        ) VALUES (
            %(program_id)s, %(exam_year)s, %(retest_candidate_count)s, %(final_admitted_count)s,
            %(interview_ratio)s, %(retest_weight)s, %(initial_exam_weight)s, %(notes)s,
            %(source_confidence)s
        )
        ON CONFLICT (program_id, exam_year)
        DO UPDATE SET
            retest_candidate_count = EXCLUDED.retest_candidate_count,
            final_admitted_count = EXCLUDED.final_admitted_count,
            interview_ratio = EXCLUDED.interview_ratio,
            retest_weight = EXCLUDED.retest_weight,
            initial_exam_weight = EXCLUDED.initial_exam_weight,
            notes = EXCLUDED.notes,
            source_confidence = EXCLUDED.source_confidence,
            updated_at = NOW()
        """,
        values,
    )


def upsert_subject(conn: Any, lookup: LookupTables, row: dict[str, str]) -> str:
    name = row["name"].strip()
    code = empty_to_none(row.get("code"))
    category = row["category"].strip()

    if code and code in lookup.subjects_by_code:
        subject_id = lookup.subjects_by_code[code]
        conn.execute(
            """
            UPDATE subjects SET
                name = %(name)s,
                category = %(category)s,
                updated_at = NOW()
            WHERE id = %(id)s
            """,
            {"id": subject_id, "name": name, "category": category},
        )
        return subject_id

    existing = conn.execute(
        """
        SELECT id FROM subjects
        WHERE name = %(name)s AND COALESCE(code, '') = COALESCE(%(code)s, '')
        LIMIT 1
        """,
        {"name": name, "code": code},
    ).fetchone()

    if existing:
        subject_id = str(existing["id"])
        conn.execute(
            """
            UPDATE subjects SET category = %(category)s, updated_at = NOW()
            WHERE id = %(id)s
            """,
            {"id": subject_id, "category": category},
        )
    else:
        inserted = conn.execute(
            """
            INSERT INTO subjects (name, code, category)
            VALUES (%(name)s, %(code)s, %(category)s)
            RETURNING id
            """,
            {"name": name, "code": code, "category": category},
        ).fetchone()
        subject_id = str(inserted["id"])

    if code:
        lookup.subjects_by_code[code] = subject_id
    return subject_id


def resolve_subject_id(conn: Any, lookup: LookupTables, row: dict[str, str]) -> str:
    code = empty_to_none(row.get("subject_code"))
    if code:
        if code in lookup.subjects_by_code:
            return lookup.subjects_by_code[code]
        db_row = conn.execute(
            "SELECT id FROM subjects WHERE code = %s LIMIT 1",
            (code,),
        ).fetchone()
        if db_row:
            subject_id = str(db_row["id"])
            lookup.subjects_by_code[code] = subject_id
            return subject_id
        raise ValueError(f"subject_code `{code}` not found; import subjects.csv first")

    name = row["subject_name_text"].strip()
    db_row = conn.execute(
        "SELECT id FROM subjects WHERE name = %s LIMIT 1",
        (name,),
    ).fetchone()
    if db_row:
        return str(db_row["id"])
    raise ValueError(f"subject `{name}` not found; import subjects.csv first")


def upsert_exam_subject(conn: Any, lookup: LookupTables, row: dict[str, str]) -> None:
    program_id = resolve_program_id(conn, lookup, row)
    subject_id = resolve_subject_id(conn, lookup, row)
    values = {
        "program_id": program_id,
        "subject_id": subject_id,
        "exam_year": int(row["exam_year"]),
        "sequence_no": int(row["sequence_no"]),
        "subject_role": row["subject_role"].strip(),
        "subject_code_text": empty_to_none(row.get("subject_code_text")),
        "subject_name_text": row["subject_name_text"].strip(),
        "notes": empty_to_none(row.get("notes")),
    }
    conn.execute(
        """
        INSERT INTO program_exam_subjects (
            program_id, subject_id, exam_year, sequence_no, subject_role,
            subject_code_text, subject_name_text, notes
        ) VALUES (
            %(program_id)s, %(subject_id)s, %(exam_year)s, %(sequence_no)s,
            %(subject_role)s, %(subject_code_text)s, %(subject_name_text)s, %(notes)s
        )
        ON CONFLICT (program_id, exam_year, sequence_no)
        DO UPDATE SET
            subject_id = EXCLUDED.subject_id,
            subject_role = EXCLUDED.subject_role,
            subject_code_text = EXCLUDED.subject_code_text,
            subject_name_text = EXCLUDED.subject_name_text,
            notes = EXCLUDED.notes,
            updated_at = NOW()
        """,
        values,
    )


def upsert_source_link(conn: Any, lookup: LookupTables, row: dict[str, str]) -> None:
    program_id = resolve_program_id(conn, lookup, row)
    exam_year = int(row["exam_year"])
    values = {
        "program_id": program_id,
        "exam_year": exam_year,
        "source_type": row["source_type"].strip(),
        "title": row["title"].strip(),
        "url": row["url"].strip(),
        "publisher_name": row["publisher_name"].strip(),
        "published_at": parse_optional_date(row.get("published_at")),
        "last_verified_at": parse_timestamptz(row.get("last_verified_at")),
        "status": row.get("status", "active").strip() or "active",
        "source_confidence": row["source_confidence"].strip(),
        "notes": empty_to_none(row.get("notes")),
    }
    existing = conn.execute(
        """
        SELECT id FROM program_source_links
        WHERE program_id = %(program_id)s
          AND exam_year = %(exam_year)s
          AND url = %(url)s
        LIMIT 1
        """,
        values,
    ).fetchone()

    if existing:
        conn.execute(
            """
            UPDATE program_source_links SET
                source_type = %(source_type)s,
                title = %(title)s,
                publisher_name = %(publisher_name)s,
                published_at = %(published_at)s,
                last_verified_at = %(last_verified_at)s,
                status = %(status)s,
                source_confidence = %(source_confidence)s,
                notes = %(notes)s,
                updated_at = NOW()
            WHERE id = %(id)s
            """,
            {**values, "id": existing["id"]},
        )
        return

    conn.execute(
        """
        INSERT INTO program_source_links (
            program_id, exam_year, source_type, title, url, publisher_name,
            published_at, last_verified_at, status, source_confidence, notes
        ) VALUES (
            %(program_id)s, %(exam_year)s, %(source_type)s, %(title)s, %(url)s,
            %(publisher_name)s, %(published_at)s, %(last_verified_at)s, %(status)s,
            %(source_confidence)s, %(notes)s
        )
        """,
        values,
    )


def _table_has_column(conn: Any, table_name: str, column_name: str) -> bool:
    row = conn.execute(
        """
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = %s
          AND column_name = %s
        LIMIT 1
        """,
        (table_name, column_name),
    ).fetchone()
    return row is not None


IMPORT_HANDLERS = {
    "schools.csv": lambda conn, lookup, rows: [
        upsert_school(conn, lookup, row) for row in rows
    ],
    "departments.csv": lambda conn, lookup, rows: [
        upsert_department(conn, lookup, row) for row in rows
    ],
    "programs.csv": lambda conn, lookup, rows: [
        upsert_program(conn, lookup, row) for row in rows
    ],
    "subjects.csv": lambda conn, lookup, rows: [
        upsert_subject(conn, lookup, row) for row in rows
    ],
    "program_admissions.csv": lambda conn, lookup, rows: [
        upsert_admission(conn, lookup, row) for row in rows
    ],
    "program_score_lines.csv": lambda conn, lookup, rows: [
        upsert_score_line(conn, lookup, row) for row in rows
    ],
    "program_application_stats.csv": lambda conn, lookup, rows: [
        upsert_application_stat(conn, lookup, row) for row in rows
    ],
    "program_interview_stats.csv": lambda conn, lookup, rows: [
        upsert_interview_stat(conn, lookup, row) for row in rows
    ],
    "program_exam_subjects.csv": lambda conn, lookup, rows: [
        upsert_exam_subject(conn, lookup, row) for row in rows
    ],
    "program_source_links.csv": lambda conn, lookup, rows: [
        upsert_source_link(conn, lookup, row) for row in rows
    ],
}


def run_import(config_path: Path, report_dir: Path | None = None) -> dict[str, Any]:
    config = load_config(config_path)
    input_dir = resolve_input_dir(config_path, config)
    settings = resolve_database_settings(config)

    configured_files = list(config.get("files") or [])
    files_to_import = [
        name
        for name in IMPORT_ORDER
        if name in IMPORT_HANDLERS and (not configured_files or name in configured_files)
    ]

    log: dict[str, Any] = {
        "tool": "import_to_db",
        "ok": True,
        "input_dir": str(input_dir),
        "database": {
            "host": settings.host,
            "port": settings.port,
            "name": settings.name,
            "user": settings.user,
        },
        "files": {},
    }

    lookup = LookupTables()

    with connect(settings) as conn:
        for filename in files_to_import:
            path = input_dir / filename
            if not path.exists():
                raise FileNotFoundError(f"Missing import file: {path}")

            if filename == "program_source_links.csv" and not _table_has_column(
                conn, "program_source_links", "source_confidence"
            ):
                log["files"][filename] = {
                    "rows": 0,
                    "status": "skipped",
                    "reason": "program_source_links.source_confidence missing; apply docs/schema.sql",
                }
                continue

            rows = read_csv_rows(path)
            handler = IMPORT_HANDLERS[filename]
            try:
                with conn.transaction():
                    handler(conn, lookup, rows)
                log["files"][filename] = {"rows": len(rows), "status": "imported"}
            except Exception as exc:  # noqa: BLE001
                log["ok"] = False
                log["files"][filename] = {
                    "rows": len(rows),
                    "status": "failed",
                    "error": str(exc),
                }
                raise

    if report_dir:
        report_dir.mkdir(parents=True, exist_ok=True)
        report_path = report_dir / "import-log.json"
        report_path.write_text(
            json.dumps(log, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        log["import_log_path"] = str(report_path)

    return log


def main() -> int:
    parser = argparse.ArgumentParser(description="Import normalized CSV batch into PostgreSQL.")
    parser.add_argument(
        "--config",
        required=True,
        help="Path to import config JSON (e.g. config.import-ecust-cs-2024.yaml)",
    )
    parser.add_argument(
        "--report-dir",
        default="",
        help="Optional directory for import-log.json",
    )
    args = parser.parse_args()

    config_path = Path(args.config).resolve()
    report_dir = Path(args.report_dir).resolve() if args.report_dir else None

    try:
        result = run_import(config_path, report_dir=report_dir)
    except Exception as exc:  # noqa: BLE001 - CLI surfaces failure to shell
        print(f"import_to_db failed: {exc}", file=sys.stderr)
        return 1

    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
