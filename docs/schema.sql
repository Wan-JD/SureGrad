BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(30) NOT NULL,
    password_hash VARCHAR(255),
    nickname VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_users_phone UNIQUE (phone),
    CONSTRAINT chk_users_status CHECK (status IN ('active', 'disabled'))
);

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    exam_year INT NOT NULL,
    identity_type VARCHAR(20) NOT NULL,
    undergraduate_major VARCHAR(255) NOT NULL,
    intended_discipline VARCHAR(255) NOT NULL,
    daily_study_hours NUMERIC(4,1),
    exam_math_required BOOLEAN NOT NULL DEFAULT FALSE,
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_profiles_user_id UNIQUE (user_id),
    CONSTRAINT fk_user_profiles_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT chk_user_profiles_exam_year CHECK (exam_year >= 2000),
    CONSTRAINT chk_user_profiles_identity_type CHECK (identity_type IN ('fresh', 'second_try', 'working')),
    CONSTRAINT chk_user_profiles_daily_study_hours CHECK (
        daily_study_hours IS NULL OR (daily_study_hours >= 0 AND daily_study_hours <= 24)
    )
);

CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    short_name VARCHAR(100) NOT NULL,
    code VARCHAR(50),
    province VARCHAR(50) NOT NULL,
    city VARCHAR(50) NOT NULL,
    school_type VARCHAR(50) NOT NULL,
    school_level VARCHAR(100) NOT NULL,
    has_graduate_school BOOLEAN NOT NULL DEFAULT FALSE,
    official_website TEXT,
    graduate_website TEXT,
    description TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_schools_sort_order CHECK (sort_order >= 0),
    CONSTRAINT chk_schools_status CHECK (status IN ('active', 'inactive'))
);

CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50),
    website TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT fk_departments_school_id FOREIGN KEY (school_id) REFERENCES schools (id) ON DELETE CASCADE,
    CONSTRAINT chk_departments_status CHECK (status IN ('active', 'inactive'))
);

CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL,
    department_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) NOT NULL,
    degree_type VARCHAR(20) NOT NULL,
    discipline_category VARCHAR(100) NOT NULL,
    research_direction VARCHAR(255),
    exam_math_required BOOLEAN NOT NULL DEFAULT FALSE,
    duration_years NUMERIC(3,1) NOT NULL,
    tuition_per_year NUMERIC(10,2) NOT NULL,
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT fk_programs_school_id FOREIGN KEY (school_id) REFERENCES schools (id) ON DELETE CASCADE,
    CONSTRAINT fk_programs_department_id FOREIGN KEY (department_id) REFERENCES departments (id) ON DELETE CASCADE,
    CONSTRAINT chk_programs_degree_type CHECK (degree_type IN ('academic', 'professional')),
    CONSTRAINT chk_programs_duration_years CHECK (duration_years > 0),
    CONSTRAINT chk_programs_tuition_per_year CHECK (tuition_per_year >= 0),
    CONSTRAINT chk_programs_status CHECK (status IN ('active', 'inactive'))
);

CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50),
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_subjects_category CHECK (category IN ('politics', 'english', 'math', 'major', 'custom'))
);

CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    publisher VARCHAR(255) NOT NULL,
    isbn VARCHAR(50),
    edition VARCHAR(100),
    cover_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE program_admissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL,
    exam_year INT NOT NULL,
    planned_enrollment INT NOT NULL,
    recommended_exemption_count INT NOT NULL DEFAULT 0,
    unified_exam_quota INT NOT NULL DEFAULT 0,
    actual_enrollment INT,
    is_cross_major_allowed BOOLEAN NOT NULL DEFAULT FALSE,
    memo TEXT,
    source_confidence VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_program_admissions_program_id_exam_year UNIQUE (program_id, exam_year),
    CONSTRAINT fk_program_admissions_program_id FOREIGN KEY (program_id) REFERENCES programs (id) ON DELETE CASCADE,
    CONSTRAINT chk_program_admissions_exam_year CHECK (exam_year >= 2000),
    CONSTRAINT chk_program_admissions_counts CHECK (
        planned_enrollment >= 0
        AND recommended_exemption_count >= 0
        AND unified_exam_quota >= 0
        AND (actual_enrollment IS NULL OR actual_enrollment >= 0)
    ),
    CONSTRAINT chk_program_admissions_source_confidence CHECK (source_confidence IN ('official', 'estimated', 'manual'))
);

CREATE TABLE program_score_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL,
    exam_year INT NOT NULL,
    total_score INT NOT NULL,
    politics_score INT NOT NULL,
    english_score INT NOT NULL,
    subject_one_score INT NOT NULL,
    subject_two_score INT NOT NULL,
    score_line_type VARCHAR(30) NOT NULL,
    notes TEXT,
    source_confidence VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_program_score_lines_program_id_exam_year_type UNIQUE (program_id, exam_year, score_line_type),
    CONSTRAINT fk_program_score_lines_program_id FOREIGN KEY (program_id) REFERENCES programs (id) ON DELETE CASCADE,
    CONSTRAINT chk_program_score_lines_exam_year CHECK (exam_year >= 2000),
    CONSTRAINT chk_program_score_lines_scores CHECK (
        total_score >= 0
        AND politics_score >= 0
        AND english_score >= 0
        AND subject_one_score >= 0
        AND subject_two_score >= 0
    ),
    CONSTRAINT chk_program_score_lines_type CHECK (score_line_type IN ('national_a', 'national_b', 'school', 'retest')),
    CONSTRAINT chk_program_score_lines_source_confidence CHECK (source_confidence IN ('official', 'estimated', 'manual'))
);

CREATE TABLE program_application_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL,
    exam_year INT NOT NULL,
    applicant_count INT NOT NULL,
    actual_exam_count INT,
    admitted_count INT NOT NULL,
    application_ratio NUMERIC(8,2) NOT NULL,
    notes TEXT,
    source_confidence VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_program_application_stats_program_id_exam_year UNIQUE (program_id, exam_year),
    CONSTRAINT fk_program_application_stats_program_id FOREIGN KEY (program_id) REFERENCES programs (id) ON DELETE CASCADE,
    CONSTRAINT chk_program_application_stats_exam_year CHECK (exam_year >= 2000),
    CONSTRAINT chk_program_application_stats_counts CHECK (
        applicant_count >= 0
        AND (actual_exam_count IS NULL OR actual_exam_count >= 0)
        AND admitted_count >= 0
        AND application_ratio >= 0
    ),
    CONSTRAINT chk_program_application_stats_source_confidence CHECK (source_confidence IN ('official', 'estimated', 'manual'))
);

CREATE TABLE program_interview_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL,
    exam_year INT NOT NULL,
    retest_candidate_count INT NOT NULL,
    final_admitted_count INT NOT NULL,
    interview_ratio NUMERIC(8,2) NOT NULL,
    retest_weight NUMERIC(5,2) NOT NULL,
    initial_exam_weight NUMERIC(5,2) NOT NULL,
    notes TEXT,
    source_confidence VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_program_interview_stats_program_id_exam_year UNIQUE (program_id, exam_year),
    CONSTRAINT fk_program_interview_stats_program_id FOREIGN KEY (program_id) REFERENCES programs (id) ON DELETE CASCADE,
    CONSTRAINT chk_program_interview_stats_exam_year CHECK (exam_year >= 2000),
    CONSTRAINT chk_program_interview_stats_values CHECK (
        retest_candidate_count >= 0
        AND final_admitted_count >= 0
        AND interview_ratio >= 0
        AND retest_weight >= 0 AND retest_weight <= 100
        AND initial_exam_weight >= 0 AND initial_exam_weight <= 100
    ),
    CONSTRAINT chk_program_interview_stats_source_confidence CHECK (source_confidence IN ('official', 'estimated', 'manual'))
);

CREATE TABLE program_exam_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    exam_year INT NOT NULL,
    sequence_no INT NOT NULL,
    subject_role VARCHAR(30) NOT NULL,
    subject_code_text VARCHAR(50),
    subject_name_text VARCHAR(200) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_program_exam_subjects_program_year_sequence UNIQUE (program_id, exam_year, sequence_no),
    CONSTRAINT fk_program_exam_subjects_program_id FOREIGN KEY (program_id) REFERENCES programs (id) ON DELETE CASCADE,
    CONSTRAINT fk_program_exam_subjects_subject_id FOREIGN KEY (subject_id) REFERENCES subjects (id),
    CONSTRAINT chk_program_exam_subjects_exam_year CHECK (exam_year >= 2000),
    CONSTRAINT chk_program_exam_subjects_sequence_no CHECK (sequence_no BETWEEN 1 AND 4),
    CONSTRAINT chk_program_exam_subjects_role CHECK (subject_role IN ('politics', 'english', 'math', 'major_1', 'major_2'))
);

CREATE TABLE program_reference_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL,
    book_id UUID NOT NULL,
    exam_year INT NOT NULL,
    subject_role VARCHAR(30) NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_program_reference_books_program_id FOREIGN KEY (program_id) REFERENCES programs (id) ON DELETE CASCADE,
    CONSTRAINT fk_program_reference_books_book_id FOREIGN KEY (book_id) REFERENCES books (id),
    CONSTRAINT chk_program_reference_books_exam_year CHECK (exam_year >= 2000),
    CONSTRAINT chk_program_reference_books_role CHECK (subject_role IN ('politics', 'english', 'math', 'major_1', 'major_2'))
);

CREATE TABLE program_source_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL,
    exam_year INT,
    source_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    publisher_name VARCHAR(255) NOT NULL,
    published_at DATE,
    last_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    source_confidence VARCHAR(20) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_program_source_links_program_id FOREIGN KEY (program_id) REFERENCES programs (id) ON DELETE CASCADE,
    CONSTRAINT chk_program_source_links_exam_year CHECK (exam_year IS NULL OR exam_year >= 2000),
    CONSTRAINT chk_program_source_links_type CHECK (source_type IN ('brochure', 'catalog', 'retest_rule', 'official_notice', 'other')),
    CONSTRAINT chk_program_source_links_status CHECK (status IN ('active', 'invalid', 'pending')),
    CONSTRAINT chk_program_source_links_source_confidence CHECK (source_confidence IN ('official', 'estimated', 'manual'))
);

CREATE TABLE study_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    subject_id UUID,
    stage_tag VARCHAR(50) NOT NULL,
    source_url TEXT NOT NULL,
    provider_name VARCHAR(255) NOT NULL,
    summary TEXT,
    usage_advice TEXT,
    is_public_legal BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_study_resources_subject_id FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE SET NULL,
    CONSTRAINT chk_study_resources_type CHECK (resource_type IN ('course', 'book', 'past_exam', 'public_resource', 'article')),
    CONSTRAINT chk_study_resources_stage_tag CHECK (stage_tag IN ('foundation', 'intensive', 'final', 'interview')),
    CONSTRAINT chk_study_resources_status CHECK (status IN ('active', 'inactive'))
);

CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    target_type VARCHAR(30) NOT NULL,
    target_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_favorites_user_target UNIQUE (user_id, target_type, target_id),
    CONSTRAINT fk_favorites_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT chk_favorites_target_type CHECK (target_type IN ('school', 'program', 'resource'))
);

CREATE TABLE comparison_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    target_type VARCHAR(30) NOT NULL,
    target_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_comparison_items_user_target UNIQUE (user_id, target_type, target_id),
    CONSTRAINT fk_comparison_items_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT chk_comparison_items_target_type CHECK (target_type IN ('school', 'program'))
);

CREATE TABLE user_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    school_id UUID NOT NULL,
    department_id UUID,
    program_id UUID,
    target_score INT,
    target_status VARCHAR(20) NOT NULL DEFAULT 'active',
    selected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user_targets_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_user_targets_school_id FOREIGN KEY (school_id) REFERENCES schools (id),
    CONSTRAINT fk_user_targets_department_id FOREIGN KEY (department_id) REFERENCES departments (id),
    CONSTRAINT fk_user_targets_program_id FOREIGN KEY (program_id) REFERENCES programs (id),
    CONSTRAINT chk_user_targets_target_score CHECK (target_score IS NULL OR target_score >= 0),
    CONSTRAINT chk_user_targets_status CHECK (target_status IN ('active', 'archived'))
);

CREATE TABLE study_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    user_target_id UUID NOT NULL,
    template_type VARCHAR(30) NOT NULL,
    title VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    total_expected_hours NUMERIC(8,1),
    plan_snapshot JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_study_plans_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_study_plans_user_target_id FOREIGN KEY (user_target_id) REFERENCES user_targets (id),
    CONSTRAINT chk_study_plans_template_type CHECK (template_type IN ('standard', 'weak_foundation', 'cross_major', 'working')),
    CONSTRAINT chk_study_plans_date_range CHECK (end_date >= start_date),
    CONSTRAINT chk_study_plans_status CHECK (status IN ('draft', 'active', 'completed', 'archived')),
    CONSTRAINT chk_study_plans_total_expected_hours CHECK (total_expected_hours IS NULL OR total_expected_hours >= 0)
);

CREATE TABLE study_plan_phases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_plan_id UUID NOT NULL,
    phase_type VARCHAR(30) NOT NULL,
    title VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    focus_subjects JSONB NOT NULL DEFAULT '[]'::JSONB,
    goals TEXT,
    sort_order INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_study_plan_phases_study_plan_id FOREIGN KEY (study_plan_id) REFERENCES study_plans (id) ON DELETE CASCADE,
    CONSTRAINT chk_study_plan_phases_phase_type CHECK (phase_type IN ('foundation', 'intensive', 'final', 'interview')),
    CONSTRAINT chk_study_plan_phases_date_range CHECK (end_date >= start_date),
    CONSTRAINT chk_study_plan_phases_sort_order CHECK (sort_order >= 0)
);

CREATE TABLE weekly_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_plan_id UUID NOT NULL,
    phase_id UUID,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    title VARCHAR(255) NOT NULL,
    goals TEXT,
    expected_hours NUMERIC(6,1),
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_weekly_plans_plan_id_week_start_date UNIQUE (study_plan_id, week_start_date),
    CONSTRAINT fk_weekly_plans_study_plan_id FOREIGN KEY (study_plan_id) REFERENCES study_plans (id) ON DELETE CASCADE,
    CONSTRAINT fk_weekly_plans_phase_id FOREIGN KEY (phase_id) REFERENCES study_plan_phases (id) ON DELETE SET NULL,
    CONSTRAINT chk_weekly_plans_date_range CHECK (week_end_date >= week_start_date),
    CONSTRAINT chk_weekly_plans_expected_hours CHECK (expected_hours IS NULL OR expected_hours >= 0),
    CONSTRAINT chk_weekly_plans_status CHECK (status IN ('draft', 'active', 'completed', 'skipped'))
);

CREATE TABLE daily_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_plan_id UUID NOT NULL,
    weekly_plan_id UUID,
    plan_date DATE NOT NULL,
    title VARCHAR(255) NOT NULL,
    expected_hours NUMERIC(5,1),
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_daily_plans_plan_id_plan_date UNIQUE (study_plan_id, plan_date),
    CONSTRAINT fk_daily_plans_study_plan_id FOREIGN KEY (study_plan_id) REFERENCES study_plans (id) ON DELETE CASCADE,
    CONSTRAINT fk_daily_plans_weekly_plan_id FOREIGN KEY (weekly_plan_id) REFERENCES weekly_plans (id) ON DELETE SET NULL,
    CONSTRAINT chk_daily_plans_expected_hours CHECK (expected_hours IS NULL OR expected_hours >= 0),
    CONSTRAINT chk_daily_plans_status CHECK (status IN ('draft', 'active', 'completed', 'skipped'))
);

CREATE TABLE todo_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    study_plan_id UUID,
    weekly_plan_id UUID,
    daily_plan_id UUID,
    subject_id UUID,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    expected_minutes INT NOT NULL DEFAULT 0,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    source_type VARCHAR(20) NOT NULL DEFAULT 'manual',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_todo_items_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_todo_items_study_plan_id FOREIGN KEY (study_plan_id) REFERENCES study_plans (id) ON DELETE SET NULL,
    CONSTRAINT fk_todo_items_weekly_plan_id FOREIGN KEY (weekly_plan_id) REFERENCES weekly_plans (id) ON DELETE SET NULL,
    CONSTRAINT fk_todo_items_daily_plan_id FOREIGN KEY (daily_plan_id) REFERENCES daily_plans (id) ON DELETE SET NULL,
    CONSTRAINT fk_todo_items_subject_id FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE SET NULL,
    CONSTRAINT chk_todo_items_expected_minutes CHECK (expected_minutes >= 0),
    CONSTRAINT chk_todo_items_priority CHECK (priority IN ('low', 'medium', 'high')),
    CONSTRAINT chk_todo_items_source_type CHECK (source_type IN ('manual', 'generated')),
    CONSTRAINT chk_todo_items_status CHECK (status IN ('pending', 'completed', 'cancelled')),
    CONSTRAINT chk_todo_items_completed_at CHECK ((status = 'completed') = (completed_at IS NOT NULL)),
    CONSTRAINT chk_todo_items_sort_order CHECK (sort_order >= 0)
);

CREATE TABLE study_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    checkin_date DATE NOT NULL,
    total_study_minutes INT NOT NULL DEFAULT 0,
    completed_todo_count INT NOT NULL DEFAULT 0,
    primary_subject_id UUID,
    reflection TEXT,
    mood_tag VARCHAR(30),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_study_checkins_user_id_checkin_date UNIQUE (user_id, checkin_date),
    CONSTRAINT fk_study_checkins_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_study_checkins_primary_subject_id FOREIGN KEY (primary_subject_id) REFERENCES subjects (id) ON DELETE SET NULL,
    CONSTRAINT chk_study_checkins_totals CHECK (total_study_minutes >= 0 AND completed_todo_count >= 0)
);

CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    reminder_type VARCHAR(30) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    remind_at TIMESTAMPTZ NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    is_system_default BOOLEAN NOT NULL DEFAULT FALSE,
    related_target_type VARCHAR(30),
    related_target_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_reminders_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT chk_reminders_type CHECK (reminder_type IN ('study', 'todo', 'exam_node', 'system')),
    CONSTRAINT chk_reminders_related_target_type CHECK (
        related_target_type IS NULL OR related_target_type IN ('todo', 'plan', 'program', 'other')
    ),
    CONSTRAINT chk_reminders_related_target_pair CHECK ((related_target_type IS NULL) = (related_target_id IS NULL))
);

CREATE UNIQUE INDEX uq_schools_name_city
    ON schools (name, city)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_schools_name
    ON schools (name);

CREATE INDEX idx_schools_province_city
    ON schools (province, city);

CREATE INDEX idx_schools_status
    ON schools (status);

CREATE UNIQUE INDEX uq_departments_school_id_name
    ON departments (school_id, name)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_departments_school_id
    ON departments (school_id);

CREATE UNIQUE INDEX uq_programs_department_id_code_direction
    ON programs (department_id, code, COALESCE(research_direction, ''))
    WHERE deleted_at IS NULL;

CREATE INDEX idx_programs_school_id
    ON programs (school_id);

CREATE INDEX idx_programs_department_id
    ON programs (department_id);

CREATE INDEX idx_programs_name
    ON programs (name);

CREATE INDEX idx_programs_degree_type
    ON programs (degree_type);

CREATE INDEX idx_programs_discipline_category
    ON programs (discipline_category);

CREATE UNIQUE INDEX uq_subjects_name_code
    ON subjects (name, COALESCE(code, ''));

CREATE INDEX idx_program_admissions_program_year
    ON program_admissions (program_id, exam_year);

CREATE INDEX idx_program_score_lines_program_year
    ON program_score_lines (program_id, exam_year);

CREATE INDEX idx_program_score_lines_year_type
    ON program_score_lines (exam_year, score_line_type);

CREATE INDEX idx_program_application_stats_program_year
    ON program_application_stats (program_id, exam_year);

CREATE INDEX idx_program_interview_stats_program_year
    ON program_interview_stats (program_id, exam_year);

CREATE INDEX idx_program_exam_subjects_program_year
    ON program_exam_subjects (program_id, exam_year);

CREATE INDEX idx_program_reference_books_program_year
    ON program_reference_books (program_id, exam_year);

CREATE INDEX idx_program_source_links_program_year
    ON program_source_links (program_id, exam_year);

CREATE INDEX idx_program_source_links_status
    ON program_source_links (status);

CREATE UNIQUE INDEX uq_program_source_links_program_year_url
    ON program_source_links (program_id, exam_year, url)
    WHERE exam_year IS NOT NULL;

CREATE UNIQUE INDEX uq_program_source_links_program_url_when_year_null
    ON program_source_links (program_id, url)
    WHERE exam_year IS NULL;

CREATE INDEX idx_study_resources_type_stage
    ON study_resources (resource_type, stage_tag);

CREATE INDEX idx_study_resources_subject_id
    ON study_resources (subject_id);

CREATE INDEX idx_favorites_user_id
    ON favorites (user_id);

CREATE INDEX idx_favorites_target_type_target_id
    ON favorites (target_type, target_id);

CREATE INDEX idx_user_targets_user_id_status
    ON user_targets (user_id, target_status);

CREATE UNIQUE INDEX uq_user_targets_user_id_active
    ON user_targets (user_id)
    WHERE target_status = 'active';

CREATE INDEX idx_study_plans_user_id_status
    ON study_plans (user_id, status);

CREATE INDEX idx_study_plans_user_target_id
    ON study_plans (user_target_id);

CREATE INDEX idx_study_plan_phases_plan_id
    ON study_plan_phases (study_plan_id);

CREATE INDEX idx_daily_plans_plan_date
    ON daily_plans (plan_date);

CREATE INDEX idx_daily_plans_weekly_plan_id
    ON daily_plans (weekly_plan_id);

CREATE INDEX idx_todo_items_user_id_due_date
    ON todo_items (user_id, due_date);

CREATE INDEX idx_todo_items_user_due_date_status
    ON todo_items (user_id, due_date, status);

CREATE INDEX idx_todo_items_daily_plan_id
    ON todo_items (daily_plan_id);

CREATE INDEX idx_todo_items_status
    ON todo_items (status);

CREATE INDEX idx_todo_items_subject_id
    ON todo_items (subject_id);

CREATE INDEX idx_study_checkins_user_id_date
    ON study_checkins (user_id, checkin_date);

CREATE INDEX idx_reminders_user_id_remind_at
    ON reminders (user_id, remind_at);

CREATE INDEX idx_reminders_type_enabled
    ON reminders (reminder_type, is_enabled);

COMMIT;
