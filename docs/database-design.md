# SureGrad 数据库设计文档

版本：`v0.1`

日期：`2026-05-16`

关联文档：

- [project-plan.md](C:/Users/hp/Documents/SureGrad/docs/project-plan.md)
- [prd.md](C:/Users/hp/Documents/SureGrad/docs/prd.md)

适用范围：`MVP 数据模型设计 / PostgreSQL`

## 1. 文档目标

本文档用于明确 SureGrad MVP 阶段的核心数据库模型，覆盖以下两条主链路：

1. 择校数据链路：学校、院系、专业、分数线、报录比、复录比、考试科目、参考书、官方来源
2. 学习执行链路：用户、目标院校、学习计划、周计划、日计划、Todo、打卡

本文档面向后端开发、数据导入、管理后台和测试使用，目标是让后续线程可以直接据此继续拆 API、建表和写导入脚本。

## 2. 设计原则

### 2.1 总体原则

1. 先满足 MVP，避免过早复杂化
2. 所有关键择校数据必须带年份维度
3. 所有关键展示数据尽量保留来源追踪能力
4. 数据缺失和估算值要可标记，不用空白掩盖
5. 用户侧计划与执行数据要支持后续统计扩展

### 2.2 技术假设

1. 数据库：`PostgreSQL`
2. 主键类型：`UUID`
3. 时间字段：统一使用 `timestamptz`
4. 逻辑删除：优先对后台运营数据使用 `deleted_at`
5. 审计字段：核心表统一保留 `created_at`、`updated_at`

### 2.3 命名规范

1. 表名使用复数下划线风格，如 `schools`
2. 主键统一为 `id`
3. 外键统一为 `<entity>_id`
4. 布尔字段使用 `is_`、`has_` 前缀
5. 枚举尽量先用文本字段加约束，MVP 阶段不强依赖数据库 enum

## 3. 逻辑分层

建议按 6 组领域模型理解数据库：

1. 基础院校域
2. 年份招生与竞争域
3. 考试与资料域
4. 用户与目标域
5. 计划与任务域
6. 打卡与统计域

## 4. 核心实体关系

## 4.1 择校主链路

`schools -> departments -> programs`

在 `programs` 之上挂接：

1. `program_admissions`
2. `program_score_lines`
3. `program_application_stats`
4. `program_interview_stats`
5. `program_exam_subjects`
6. `program_reference_books`
7. `program_source_links`

### 4.2 用户执行主链路

`users -> user_profiles -> user_targets -> study_plans -> study_plan_phases -> weekly_plans -> daily_plans -> todo_items -> study_checkins`

## 5. 表设计总览

MVP 建议优先建设以下表：

1. `users`
2. `user_profiles`
3. `schools`
4. `departments`
5. `programs`
6. `program_admissions`
7. `program_score_lines`
8. `program_application_stats`
9. `program_interview_stats`
10. `subjects`
11. `program_exam_subjects`
12. `books`
13. `program_reference_books`
14. `program_source_links`
15. `study_resources`
16. `favorites`
17. `comparison_items`
18. `user_targets`
19. `study_plans`
20. `study_plan_phases`
21. `weekly_plans`
22. `daily_plans`
23. `todo_items`
24. `study_checkins`
25. `reminders`

## 6. 基础院校域

## 6.1 `schools`

用途：存储学校基础信息。

关键字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| name | varchar(200) | 学校名称 |
| short_name | varchar(100) | 学校简称 |
| code | varchar(50) | 学校代码，可为空 |
| province | varchar(50) | 省份 |
| city | varchar(50) | 城市 |
| school_type | varchar(50) | 综合、理工、师范等 |
| school_level | varchar(100) | 985/211/双一流/普通等，可多标签拼接或后续拆表 |
| has_graduate_school | boolean | 是否有研究生院 |
| official_website | text | 学校官网 |
| graduate_website | text | 研究生院官网 |
| description | text | 简介 |
| sort_order | int | 排序值 |
| status | varchar(20) | active/inactive |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |
| deleted_at | timestamptz | 逻辑删除时间 |

索引建议：

1. `idx_schools_name`
2. `idx_schools_province_city`
3. `idx_schools_status`

唯一约束建议：

1. `uq_schools_name_city`

## 6.2 `departments`

用途：存储学校下的院系信息。

关键字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| school_id | uuid | 所属学校 |
| name | varchar(200) | 院系名称 |
| code | varchar(50) | 院系代码，可为空 |
| website | text | 院系官网 |
| status | varchar(20) | active/inactive |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |
| deleted_at | timestamptz | 逻辑删除时间 |

约束建议：

1. `fk_departments_school_id`
2. `uq_departments_school_id_name`

索引建议：

1. `idx_departments_school_id`

## 6.3 `programs`

用途：存储招生专业信息，是择校数据的核心实体。

关键字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| school_id | uuid | 所属学校 |
| department_id | uuid | 所属院系 |
| name | varchar(200) | 专业名称 |
| code | varchar(50) | 专业代码 |
| degree_type | varchar(20) | academic/professional |
| discipline_category | varchar(100) | 学科门类 |
| research_direction | varchar(255) | 研究方向，可为空 |
| exam_math_required | boolean | 是否考数学 |
| duration_years | numeric(3,1) | 学制 |
| tuition_per_year | numeric(10,2) | 年学费 |
| notes | text | 备注 |
| status | varchar(20) | active/inactive |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |
| deleted_at | timestamptz | 逻辑删除时间 |

约束建议：

1. `fk_programs_school_id`
2. `fk_programs_department_id`
3. `uq_programs_department_id_code_direction`

索引建议：

1. `idx_programs_school_id`
2. `idx_programs_department_id`
3. `idx_programs_name`
4. `idx_programs_degree_type`
5. `idx_programs_discipline_category`

说明：

1. `programs` 以“具体招生专业”为粒度
2. 如果同一专业在同一院系下有多个研究方向，可多行存储

## 7. 年份招生与竞争域

MVP 阶段不建议把年份数据直接堆在 `programs` 表中，应独立按年存储。

## 7.1 `program_admissions`

用途：存储专业在某一招生年份下的招生信息。

关键字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| program_id | uuid | 专业 ID |
| exam_year | int | 招生年份 |
| planned_enrollment | int | 计划招生人数 |
| recommended_exemption_count | int | 推免人数 |
| unified_exam_quota | int | 统考名额 |
| actual_enrollment | int | 实际录取人数，可为空 |
| is_cross_major_allowed | boolean | 是否接受跨考 |
| memo | text | 备注 |
| source_confidence | varchar(20) | official/estimated/manual |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

约束建议：

1. `uq_program_admissions_program_id_exam_year`

索引建议：

1. `idx_program_admissions_program_year`

## 7.2 `program_score_lines`

用途：存储专业分数线信息。

关键字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| program_id | uuid | 专业 ID |
| exam_year | int | 年份 |
| total_score | int | 总分线 |
| politics_score | int | 政治单科线 |
| english_score | int | 英语单科线 |
| subject_one_score | int | 业务课一或数学单科线 |
| subject_two_score | int | 业务课二单科线 |
| score_line_type | varchar(30) | national_a/national_b/school/retest |
| notes | text | 备注 |
| source_confidence | varchar(20) | official/estimated/manual |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

约束建议：

1. `uq_program_score_lines_program_id_exam_year_type`

索引建议：

1. `idx_program_score_lines_program_year`
2. `idx_program_score_lines_year_type`

说明：

1. 同一专业同一年可能既有国家线也有院校复试线，因此需要 `score_line_type`

## 7.3 `program_application_stats`

用途：存储报录比相关数据。

关键字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| program_id | uuid | 专业 ID |
| exam_year | int | 年份 |
| applicant_count | int | 报名人数 |
| actual_exam_count | int | 实考人数，可为空 |
| admitted_count | int | 录取人数 |
| application_ratio | numeric(8,2) | 报录比 |
| notes | text | 备注 |
| source_confidence | varchar(20) | official/estimated/manual |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

约束建议：

1. `uq_program_application_stats_program_id_exam_year`

索引建议：

1. `idx_program_application_stats_program_year`

说明：

1. `application_ratio` 可冗余存储，便于查询展示
2. 导入时应同时保留原始人数，避免只留比例

## 7.4 `program_interview_stats`

用途：存储复录比和复试数据。

关键字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| program_id | uuid | 专业 ID |
| exam_year | int | 年份 |
| retest_candidate_count | int | 进入复试人数 |
| final_admitted_count | int | 最终录取人数 |
| interview_ratio | numeric(8,2) | 复录比 |
| retest_weight | numeric(5,2) | 复试权重百分比 |
| initial_exam_weight | numeric(5,2) | 初试权重百分比 |
| notes | text | 备注 |
| source_confidence | varchar(20) | official/estimated/manual |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

约束建议：

1. `uq_program_interview_stats_program_id_exam_year`

索引建议：

1. `idx_program_interview_stats_program_year`

说明：

1. `interview_ratio` 在中文语境下实际对应“复试录取比/复录比”，这里统一落库

## 8. 考试与资料域

## 8.1 `subjects`

用途：统一管理考试科目和学习科目。

关键字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| name | varchar(100) | 科目名称 |
| code | varchar(50) | 科目代码，可为空 |
| category | varchar(50) | politics/english/math/major/custom |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

约束建议：

1. `uq_subjects_name_code`

## 8.2 `program_exam_subjects`

用途：建立专业与初试科目的关系。

关键字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| program_id | uuid | 专业 ID |
| subject_id | uuid | 科目 ID |
| exam_year | int | 年份 |
| sequence_no | int | 顺序，如 1~4 |
| subject_role | varchar(30) | politics/english/math/major_1/major_2 |
| subject_code_text | varchar(50) | 页面展示代码 |
| subject_name_text | varchar(200) | 页面展示名称 |
| notes | text | 备注 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

约束建议：

1. `uq_program_exam_subjects_program_year_sequence`

索引建议：

1. `idx_program_exam_subjects_program_year`

说明：

1. 保留 `subject_name_text` 是为了避免官方名称轻微变动时破坏历史展示

## 8.3 `books`

用途：统一管理参考书。

关键字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| title | varchar(255) | 书名 |
| author | varchar(255) | 作者 |
| publisher | varchar(255) | 出版社 |
| isbn | varchar(50) | ISBN，可为空 |
| edition | varchar(100) | 版本，可为空 |
| cover_url | text | 封面地址，可为空 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

## 8.4 `program_reference_books`

用途：建立专业与参考书的关系。

关键字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| program_id | uuid | 专业 ID |
| book_id | uuid | 书 ID |
| exam_year | int | 年份 |
| subject_role | varchar(30) | 对应科目角色 |
| is_required | boolean | 是否必看 |
| notes | text | 备注 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

索引建议：

1. `idx_program_reference_books_program_year`

## 8.5 `program_source_links`

用途：记录某专业年份数据的官方或补充来源。

关键字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| program_id | uuid | 专业 ID |
| exam_year | int | 年份，可为空 |
| source_type | varchar(50) | brochure/catalog/retest_rule/official_notice/other |
| title | varchar(255) | 来源标题 |
| url | text | 来源链接 |
| publisher_name | varchar(255) | 来源发布方 |
| published_at | date | 发布时间，可为空 |
| last_verified_at | timestamptz | 最后校验时间 |
| status | varchar(20) | active/invalid/pending |
| notes | text | 备注 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

索引建议：

1. `idx_program_source_links_program_year`
2. `idx_program_source_links_status`

## 8.6 `study_resources`

用途：存储资料推荐内容。

关键字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| title | varchar(255) | 资料标题 |
| resource_type | varchar(50) | course/book/past_exam/public_resource/article |
| subject_id | uuid | 对应科目，可为空 |
| stage_tag | varchar(50) | foundation/intensive/final/interview |
| source_url | text | 来源链接 |
| provider_name | varchar(255) | 资源提供方 |
| summary | text | 简介 |
| usage_advice | text | 使用建议 |
| is_public_legal | boolean | 是否为公开合法资源 |
| status | varchar(20) | active/inactive |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

索引建议：

1. `idx_study_resources_type_stage`
2. `idx_study_resources_subject_id`

## 9. 用户与目标域

## 9.1 `users`

用途：存储账号主体。

关键字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| phone | varchar(30) | 手机号 |
| password_hash | varchar(255) | 若采用密码制，可为空 |
| nickname | varchar(100) | 昵称 |
| avatar_url | text | 头像 |
| status | varchar(20) | active/disabled |
| last_login_at | timestamptz | 最后登录时间 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

约束建议：

1. `uq_users_phone`

## 9.2 `user_profiles`

用途：存储考研相关档案。

关键字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| user_id | uuid | 用户 ID |
| exam_year | int | 备考年份 |
| identity_type | varchar(20) | fresh/second_try/working |
| undergraduate_major | varchar(255) | 本科专业 |
| intended_discipline | varchar(255) | 意向专业方向 |
| daily_study_hours | numeric(4,1) | 每日可投入时长 |
| exam_math_required | boolean | 是否考数学 |
| onboarding_completed | boolean | 是否完成新手引导 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

约束建议：

1. `uq_user_profiles_user_id`

## 9.3 `favorites`

用途：统一存储收藏行为。

关键字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| user_id | uuid | 用户 ID |
| target_type | varchar(30) | school/program/resource |
| target_id | uuid | 目标实体 ID |
| created_at | timestamptz | 创建时间 |

约束建议：

1. `uq_favorites_user_target`

索引建议：

1. `idx_favorites_user_id`
2. `idx_favorites_target_type_target_id`

## 9.4 `comparison_items`

用途：存储用户加入对比的院校或专业项。

关键字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| user_id | uuid | 用户 ID |
| target_type | varchar(30) | school/program |
| target_id | uuid | 目标实体 ID |
| created_at | timestamptz | 创建时间 |

约束建议：

1. `uq_comparison_items_user_target`

说明：

1. 若产品 later 改为“对比会话”模式，可再拆 `comparison_groups`
2. MVP 先以“用户当前对比池”处理即可
3. 表结构保留 `school/program` 两种目标类型以兼容后续演进，但 MVP 前台流程默认以 `program` 粒度发起对比

## 9.5 `user_targets`

用途：记录用户当前或历史目标。

关键字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| user_id | uuid | 用户 ID |
| school_id | uuid | 目标学校 |
| department_id | uuid | 目标院系，可为空 |
| program_id | uuid | 目标专业，可为空 |
| target_score | int | 目标分数，可为空 |
| target_status | varchar(20) | active/archived |
| selected_at | timestamptz | 选择时间 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

索引建议：

1. `idx_user_targets_user_id_status`
2. `uq_user_targets_user_id_active`（部分唯一索引）

说明：

1. 每个用户可保留历史目标，但同时仅允许一个 `active`

## 10. 计划与任务域

## 10.1 `study_plans`

用途：存储用户的整体学习路线。

关键字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| user_id | uuid | 用户 ID |
| user_target_id | uuid | 关联目标 |
| template_type | varchar(30) | standard/weak_foundation/cross_major/working |
| title | varchar(255) | 计划标题 |
| start_date | date | 开始日期 |
| end_date | date | 结束日期 |
| status | varchar(20) | draft/active/completed/archived |
| total_expected_hours | numeric(8,1) | 计划总时长 |
| plan_snapshot | jsonb | 生成时的参数快照 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

索引建议：

1. `idx_study_plans_user_id_status`
2. `idx_study_plans_user_target_id`

说明：

1. `plan_snapshot` 用来保存生成计划时的用户条件，便于复盘和重生成

## 10.2 `study_plan_phases`

用途：存储学习计划的阶段拆分。

关键字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| study_plan_id | uuid | 学习计划 ID |
| phase_type | varchar(30) | foundation/intensive/final/interview |
| title | varchar(255) | 阶段标题 |
| start_date | date | 开始日期 |
| end_date | date | 结束日期 |
| focus_subjects | jsonb | 重点科目 |
| goals | text | 阶段目标 |
| sort_order | int | 顺序 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

索引建议：

1. `idx_study_plan_phases_plan_id`

## 10.3 `weekly_plans`

用途：存储周计划。

关键字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| study_plan_id | uuid | 学习计划 ID |
| phase_id | uuid | 所属阶段，可为空 |
| week_start_date | date | 周开始日期 |
| week_end_date | date | 周结束日期 |
| title | varchar(255) | 周计划标题 |
| goals | text | 周目标 |
| expected_hours | numeric(6,1) | 预计时长 |
| status | varchar(20) | draft/active/completed/skipped |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

约束建议：

1. `uq_weekly_plans_plan_id_week_start_date`

## 10.4 `daily_plans`

用途：存储日计划。

关键字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| study_plan_id | uuid | 学习计划 ID |
| weekly_plan_id | uuid | 周计划 ID，可为空 |
| plan_date | date | 日期 |
| title | varchar(255) | 标题 |
| expected_hours | numeric(5,1) | 预计时长 |
| notes | text | 备注 |
| status | varchar(20) | draft/active/completed/skipped |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

约束建议：

1. `uq_daily_plans_plan_id_plan_date`

索引建议：

1. `idx_daily_plans_plan_date`
2. `idx_daily_plans_weekly_plan_id`

## 10.5 `todo_items`

用途：存储日常执行任务。

关键字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| user_id | uuid | 用户 ID |
| study_plan_id | uuid | 学习计划 ID，可为空 |
| weekly_plan_id | uuid | 周计划 ID，可为空 |
| daily_plan_id | uuid | 日计划 ID，可为空 |
| subject_id | uuid | 科目 ID，可为空 |
| title | varchar(255) | Todo 标题 |
| description | text | 详细说明 |
| due_date | date | 任务日期 |
| expected_minutes | int | 预计分钟数 |
| priority | varchar(20) | low/medium/high |
| source_type | varchar(20) | manual/generated |
| status | varchar(20) | pending/completed/cancelled |
| completed_at | timestamptz | 完成时间 |
| sort_order | int | 排序 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

索引建议：

1. `idx_todo_items_user_id_due_date`
2. `idx_todo_items_daily_plan_id`
3. `idx_todo_items_status`
4. `idx_todo_items_subject_id`

说明：

1. `source_type` 用来区分用户手动创建和系统自动生成
2. Todo 允许脱离日计划单独存在，保证灵活性

## 11. 打卡与统计域

## 11.1 `study_checkins`

用途：存储用户每日打卡记录。

关键字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| user_id | uuid | 用户 ID |
| checkin_date | date | 打卡日期 |
| total_study_minutes | int | 学习总时长 |
| completed_todo_count | int | 完成 Todo 数量 |
| primary_subject_id | uuid | 主攻科目，可为空 |
| reflection | text | 复盘备注 |
| mood_tag | varchar(30) | 心态标签，可为空 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

约束建议：

1. `uq_study_checkins_user_id_checkin_date`

索引建议：

1. `idx_study_checkins_user_id_date`

说明：

1. 每个用户每日仅一条主打卡
2. 补充修改通过更新记录完成
3. `completed_todo_count` 作为打卡时的系统聚合快照保存，MVP 前台默认不允许手动改写

## 11.2 `reminders`

用途：存储提醒配置。

关键字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| user_id | uuid | 用户 ID |
| reminder_type | varchar(30) | study/todo/exam_node/system |
| title | varchar(255) | 提醒标题 |
| content | text | 提醒内容 |
| remind_at | timestamptz | 提醒时间 |
| is_enabled | boolean | 是否启用 |
| is_system_default | boolean | 是否系统默认 |
| related_target_type | varchar(30) | todo/plan/program/other，可为空 |
| related_target_id | uuid | 关联目标 ID，可为空 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

索引建议：

1. `idx_reminders_user_id_remind_at`
2. `idx_reminders_type_enabled`

说明：

1. `system` 与 `exam_node` 类型主要用于系统下发或预置提醒
2. MVP 用户自定义提醒以前台 `study`、`todo` 两类为主

## 12. 建议约束与通用字段

### 12.1 通用审计字段

建议以下业务表统一具备：

1. `created_at`
2. `updated_at`
3. 需要逻辑删除的表增加 `deleted_at`

### 12.2 推荐检查约束

1. 比例字段不能为负数
2. 分数线字段不能为负数
3. 学习时长字段不能为负数
4. `week_end_date >= week_start_date`
5. `end_date >= start_date`

### 12.3 推荐唯一约束

1. 同专业同年份同类型分数线唯一
2. 同专业同年份招生记录唯一
3. 同用户同日期打卡唯一
4. 同用户同目标收藏唯一
5. 同用户同时仅允许一个 `active` 状态的目标记录

补充实现说明：

1. 对带 `deleted_at` 的表，若唯一性只针对有效数据生效，推荐使用部分唯一索引（如 `WHERE deleted_at IS NULL`）
2. 对参与唯一约束且允许为空的字段，推荐在 PostgreSQL 中使用表达式唯一索引处理 `NULL` 值语义，例如对 `research_direction`、`code` 使用 `coalesce`

## 13. 推荐枚举值

### 13.1 `degree_type`

1. `academic`
2. `professional`

### 13.2 `identity_type`

1. `fresh`
2. `second_try`
3. `working`

### 13.3 `score_line_type`

1. `national_a`
2. `national_b`
3. `school`
4. `retest`

### 13.4 `source_confidence`

1. `official`
2. `estimated`
3. `manual`

### 13.5 `template_type`

1. `standard`
2. `weak_foundation`
3. `cross_major`
4. `working`

### 13.6 `todo_status`

1. `pending`
2. `completed`
3. `cancelled`

## 14. 查询与索引重点

MVP 阶段最常见的查询场景如下：

1. 按地区、学校层次、专业门类筛选专业
2. 查看某专业近 3-5 年分数线
3. 查看某专业报录比、复录比
4. 查看用户今日 Todo
5. 查看用户某周计划与打卡统计

因此索引优先级建议：

1. `programs.school_id`
2. `programs.department_id`
3. `programs.degree_type`
4. `programs.discipline_category`
5. `program_score_lines(program_id, exam_year)`
6. `program_application_stats(program_id, exam_year)`
7. `program_interview_stats(program_id, exam_year)`
8. `todo_items(user_id, due_date, status)`
9. `study_checkins(user_id, checkin_date)`

## 15. 数据来源与可信度设计

为满足 PRD 中的来源可追踪要求，建议：

1. 关键年份数据通过 `source_confidence` 标记可信度
2. 官方链接统一进入 `program_source_links`
3. 重要展示页可在 API 层拼接“最后更新时间”和“来源入口”

如果后续运营需要更强追踪能力，可新增：

1. `data_sources`
2. `source_records`
3. `import_jobs`

MVP 阶段先不强制拆出，避免模型过重。

## 16. MVP 不纳入数据库的复杂项

以下内容建议暂不进入首版数据模型：

1. 社区发帖与评论
2. 即时消息
3. AI 对话历史
4. 深度推荐算法特征表
5. 调剂专项复杂流程表

## 17. 建表顺序建议

后端或数据库线程可按以下顺序落表：

1. `users`
2. `user_profiles`
3. `schools`
4. `departments`
5. `programs`
6. `subjects`
7. `books`
8. `program_admissions`
9. `program_score_lines`
10. `program_application_stats`
11. `program_interview_stats`
12. `program_exam_subjects`
13. `program_reference_books`
14. `program_source_links`
15. `study_resources`
16. `favorites`
17. `comparison_items`
18. `user_targets`
19. `study_plans`
20. `study_plan_phases`
21. `weekly_plans`
22. `daily_plans`
23. `todo_items`
24. `study_checkins`
25. `reminders`

## 18. 后续线程建议

现在很适合开启新的 Codex 对话并行推进，建议按下面分工开：

1. `数据库落地线程`
任务：基于本文件输出 PostgreSQL DDL 或 Prisma Schema。

2. `后端接口线程`
任务：基于 `docs/prd.md` 和本文件编写 `docs/api-spec.md`。

3. `数据采集线程`
任务：设计院校数据采集、清洗、人工校验和导入流程。

4. `产品流程线程`
任务：基于 PRD 输出 `docs/ux-flow.md` 和页面流转图。

建议你下一次新开对话时，直接复制类似提示：

`请基于 docs/database-design.md，为 SureGrad 输出 PostgreSQL 建表 SQL，包含主键、外键、唯一约束、索引和必要的检查约束，输出到 docs/schema.sql。`
