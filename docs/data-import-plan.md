# SureGrad 院校数据导入方案

版本：`v0.1`

日期：`2026-05-16`

关联文档：
- [project-plan.md](C:/Users/hp/Documents/SureGrad/docs/project-plan.md)
- [prd.md](C:/Users/hp/Documents/SureGrad/docs/prd.md)
- [database-design.md](C:/Users/hp/Documents/SureGrad/docs/database-design.md)
- [schema.sql](C:/Users/hp/Documents/SureGrad/docs/schema.sql)

适用范围：`SureGrad MVP 院校数据整理、清洗、人工校验、批量导入`

## 1. 文档目标

本文用于设计 SureGrad 的院校数据导入方案，覆盖以下数据对象：

1. 学校 `schools`
2. 院系 `departments`
3. 专业 `programs`
4. 分数线 `program_score_lines`
5. 报录比 `program_application_stats`
6. 复录比 `program_interview_stats`
7. 考试科目 `program_exam_subjects`
8. 参考书 `books` + `program_reference_books`
9. 来源链接 `program_source_links`

目标不是先做大规模采集，而是先建立一套可持续的数据导入标准，让后续人工整理、小脚本抽取、批量导入、后台修订都能使用同一套口径。

## 2. 总体策略

### 2.1 核心原则

1. 官方优先：研究生院官网、招生简章、专业目录、复试录取办法优先于第三方汇总。
2. 分层处理：先把原始数据落到中间层，再清洗成标准模板，再导入正式业务表。
3. 年份显式化：涉及招生人数、分数线、报录比、复录比、考试科目、参考书时，必须明确 `exam_year`。
4. 来源可追溯：每条关键年度数据都应能追溯到至少一个来源链接。
5. 缺失可见：未知值保留为空并打标，不允许猜测后直接入库。
6. 人工兜底：研究方向拆分、专业合并、同名学院、复试口径差异必须经过人工确认。

### 2.2 推荐导入架构

建议分成三层：

1. `raw` 原始层：保存原始 CSV、Excel、PDF 摘录、网页摘录、人工录入原文。
2. `normalized` 标准层：转成统一 CSV 或 JSON 模板，字段名固定、编码固定、口径固定。
3. `import` 入库层：按既定顺序写入 PostgreSQL 正式表，并生成导入日志。

对应流程：

`原始来源 -> 模板化整理 -> 自动校验 -> 人工复核 -> 试导入 -> 正式导入 -> 导入报告`

## 3. 原始数据来源类型

### 3.1 一级来源

1. 高校研究生院官网
2. 学校招生网 / 研究生招生网
3. 招生简章 PDF / 网页
4. 专业目录 / 招生目录
5. 复试录取办法 / 复试细则
6. 拟录取名单 / 录取名单
7. 学院官网公告

### 3.2 二级补充来源

1. 教育主管部门公开信息
2. 学校官方微信公众号公开推送
3. 校方发布的 Excel 附件或压缩包
4. 第三方公开汇总站点
5. 人工整理台账

### 3.3 来源类型到 `program_source_links.source_type` 的映射建议

1. 招生简章：`brochure`
2. 专业目录 / 招生目录：`catalog`
3. 复试录取办法 / 复试细则：`retest_rule`
4. 学校通知、拟录取名单、学院公告：`official_notice`
5. 第三方补充页、人工说明页：`other`

### 3.4 来源可信度到 `source_confidence` 的使用建议

1. `official`：学校或学院官方直接发布，且当前年份口径清晰。
2. `estimated`：第三方汇总或根据名单/公告推算，不可直接视为官方值。
3. `manual`：人工核录、人工修订、电话确认、运营备注等非自动来源。

## 4. 数据对象与采集口径

### 4.1 学校

采集粒度：学校一级。

关键字段：
`name`、`short_name`、`code`、`province`、`city`、`school_type`、`school_level`、`has_graduate_school`、`official_website`、`graduate_website`

主要来源：
学校官网、研究生院官网、学校概况页。

### 4.2 院系

采集粒度：学校下的学院 / 研究院 / 系。

关键字段：
`school_id`、`name`、`code`、`website`

主要来源：
专业目录、学院官网、招生简章附件。

### 4.3 专业

采集粒度：学校 + 院系 + 专业代码 + 研究方向。

关键字段：
`name`、`code`、`degree_type`、`discipline_category`、`research_direction`、`exam_math_required`、`duration_years`、`tuition_per_year`

主要来源：
招生目录、专业目录、招生简章。

### 4.4 分数线

采集粒度：专业 + 年份 + 分数线类型。

关键字段：
`exam_year`、`total_score`、`politics_score`、`english_score`、`subject_one_score`、`subject_two_score`、`score_line_type`

主要来源：
国家线公告、学校复试线公告、学院复试细则。

### 4.5 报录比

采集粒度：专业 + 年份。

关键字段：
`applicant_count`、`actual_exam_count`、`admitted_count`、`application_ratio`

主要来源：
学校披露统计、学院公告、招生目录补充说明、拟录取名单反推。

### 4.6 复录比

采集粒度：专业 + 年份。

关键字段：
`retest_candidate_count`、`final_admitted_count`、`interview_ratio`、`retest_weight`、`initial_exam_weight`

主要来源：
复试录取办法、复试名单、拟录取名单、学院复试细则。

### 4.7 考试科目

采集粒度：专业 + 年份 + 顺序。

关键字段：
`sequence_no`、`subject_role`、`subject_code_text`、`subject_name_text`

主要来源：
招生目录、专业目录。

### 4.8 参考书

采集粒度：专业 + 年份 + 科目角色 + 图书。

关键字段：
`title`、`author`、`publisher`、`isbn`、`edition`、`subject_role`、`is_required`

主要来源：
招生目录、考试大纲、学院参考书目公告。

### 4.9 来源链接

采集粒度：专业 + 年份，可一对多。

关键字段：
`source_type`、`title`、`url`、`publisher_name`、`published_at`、`last_verified_at`、`status`

主要来源：
所有正式导入批次都必须补齐。

## 5. 清洗规则

### 5.1 通用清洗规则

1. 文件统一转为 UTF-8。
2. 日期统一转为 `YYYY-MM-DD`。
3. URL 去除跟踪参数，保留可访问主链接。
4. 数字字段去除中文单位、空格、全角符号。
5. `--`、`暂无`、`待定`、`未公布` 转为空值，不转成 `0`。
6. 保留原始文本列，方便追溯和复核。

### 5.2 学校 / 院系 / 专业名称规则

1. 去除首尾空格、重复空格、换行。
2. 中英文括号统一为中文括号或统一半角格式，避免重复主键。
3. 学校简称不参与唯一识别，唯一识别仍以标准校名为主。
4. 院系名称保留官方全称，不自行缩写。
5. 专业方向如官方拆成多行，按多条 `programs` 处理；如只是备注，不单独拆方向。

### 5.3 专业口径规则

1. `degree_type` 只允许 `academic` / `professional`。
2. `exam_math_required` 依据考试科目判断，不允许人工凭经验填写。
3. `research_direction` 为空时使用空值，不写“无”“不限”。
4. 学制、学费缺失时允许为空，后续补录。

### 5.4 分数线规则

1. `score_line_type` 只允许 `national_a`、`national_b`、`school`、`retest`。
2. 同一专业同一年同一类型只能保留一条。
3. 单科线缺失时允许为空，但总分线与类型必须有。
4. 国家线与院校线不能混成一条。

### 5.5 报录比规则

1. 优先保留原始人数，再计算 `application_ratio`。
2. 若原始来源只有“报录比 6.5:1”，则尝试补人数；补不齐时允许仅录比，但需标记 `estimated` 或 `manual`。
3. `application_ratio` 建议统一为 `applicant_count / admitted_count`。
4. 若学校口径用“报考人数 / 统考录取人数”，应在 `notes` 记录说明。

### 5.6 复录比规则

1. `interview_ratio` 建议统一为 `retest_candidate_count / final_admitted_count`。
2. 复试权重、初试权重按百分比存储，如 `50.00`。
3. 若只披露“差额复试比例 120%”，不得直接当作复录比，需要在 `notes` 说明并标记 `estimated`。

### 5.7 考试科目规则

1. `sequence_no` 固定 1 到 4。
2. `subject_role` 固定映射：
   `1 -> politics`
   `2 -> english`
   `3 -> math 或 major_1`
   `4 -> major_2`
3. `subject_code_text` 保留原公告代码。
4. `subjects` 主表做标准化映射，但 `subject_name_text` 仍保留原文展示。

### 5.8 参考书规则

1. 同名同作者同出版社优先合并到同一本 `books`。
2. 版次写入 `edition`，不要拼进书名。
3. ISBN 缺失允许为空，不阻塞导入。
4. 如参考书对应多个科目，以 `program_reference_books.subject_role` 关联，不在 `books` 表重复造书。

### 5.9 来源链接规则

1. 每个专业每个年份至少一条来源链接，优先使用官方链接。
2. 同一链接重复出现时按 `program_id + exam_year + url` 去重。
3. 死链不删除，改 `status = invalid`，并补新链接。
4. `last_verified_at` 在每次人工确认或脚本巡检后更新。

## 6. 人工校验规则

### 6.1 必须人工确认的场景

1. 同校同院同专业同代码，但研究方向是否拆分不清晰。
2. 学院名称改名、合并、拆分。
3. 招生简章与专业目录人数不一致。
4. 分数线公告与复试细则口径不同。
5. 参考书版本多、作者信息不完整。
6. 报录比、复录比来自名单推算而非直接公告。
7. 来源链接跳转失效或需要登录后查看。

### 6.2 人工校验清单

1. 学校是否为标准名称，城市省份是否正确。
2. 院系是否确实隶属于该学校。
3. 专业代码、名称、学硕/专硕是否匹配。
4. 同一 `program` 是否被重复拆分。
5. 年份字段是否对应招生年度而非公告发布日期。
6. 比例字段是否与原始人数一致。
7. 每条年度数据是否挂了至少一个来源链接。
8. `source_confidence` 是否填得保守且准确。

### 6.3 推荐人工校验阈值

以下情况建议脚本标红并要求人工复核：

1. 同专业同年出现多条同类型分数线。
2. `application_ratio` 与人数反算误差超过 `0.05`。
3. `interview_ratio` 与人数反算误差超过 `0.05`。
4. `retest_weight + initial_exam_weight != 100`。
5. `unified_exam_quota > planned_enrollment`。
6. 引用书目未能匹配到标准图书。

## 7. 导入顺序

建议严格按依赖顺序导入：

1. 学校 `schools`
2. 院系 `departments`
3. 科目字典 `subjects`
4. 图书字典 `books`
5. 专业 `programs`
6. 年度招生信息 `program_admissions`
7. 分数线 `program_score_lines`
8. 报录比 `program_application_stats`
9. 复录比 `program_interview_stats`
10. 考试科目 `program_exam_subjects`
11. 参考书关联 `program_reference_books`
12. 来源链接 `program_source_links`

原因：

1. `programs` 依赖学校和院系。
2. 科目和图书先导入，后续关系表才能稳定关联。
3. 年度统计数据依赖 `program_id`。
4. 来源链接建议最后补齐，但在正式发布前必须完成。

## 8. 推荐导入模板

建议以 CSV 为主、JSON 为辅：

1. 结构平铺、适合运营整理的用 CSV。
2. 一条记录包含多本书、多条链接、多科目的场景，可允许附带 JSON 明细文件。
3. MVP 阶段优先保证 CSV 可直接导入，不强依赖复杂 JSON。

### 8.1 `schools.csv`

```csv
name,short_name,code,province,city,school_type,school_level,has_graduate_school,official_website,graduate_website,description,sort_order,status
```

### 8.2 `departments.csv`

```csv
school_name,school_code,department_name,department_code,website,status
```

说明：
通过 `school_name + school_code` 或内部映射定位学校。

### 8.3 `subjects.csv`

```csv
name,code,category
```

### 8.4 `books.csv`

```csv
title,author,publisher,isbn,edition,cover_url
```

### 8.5 `programs.csv`

```csv
school_name,department_name,program_name,program_code,degree_type,discipline_category,research_direction,exam_math_required,duration_years,tuition_per_year,notes,status
```

### 8.6 `program_admissions.csv`

```csv
school_name,department_name,program_code,program_name,research_direction,exam_year,planned_enrollment,recommended_exemption_count,unified_exam_quota,actual_enrollment,is_cross_major_allowed,memo,source_confidence
```

### 8.7 `program_score_lines.csv`

```csv
school_name,department_name,program_code,program_name,research_direction,exam_year,score_line_type,total_score,politics_score,english_score,subject_one_score,subject_two_score,notes,source_confidence
```

### 8.8 `program_application_stats.csv`

```csv
school_name,department_name,program_code,program_name,research_direction,exam_year,applicant_count,actual_exam_count,admitted_count,application_ratio,notes,source_confidence
```

### 8.9 `program_interview_stats.csv`

```csv
school_name,department_name,program_code,program_name,research_direction,exam_year,retest_candidate_count,final_admitted_count,interview_ratio,retest_weight,initial_exam_weight,notes,source_confidence
```

### 8.10 `program_exam_subjects.csv`

```csv
school_name,department_name,program_code,program_name,research_direction,exam_year,sequence_no,subject_role,subject_code_text,subject_name_text,subject_dict_code,notes
```

说明：
`subject_dict_code` 用于映射 `subjects` 主表，可为空；为空时由脚本按名称匹配。

### 8.11 `program_reference_books.csv`

```csv
school_name,department_name,program_code,program_name,research_direction,exam_year,subject_role,book_title,book_author,book_publisher,book_isbn,is_required,notes
```

说明：
先按书目信息映射 `books`，再生成 `program_reference_books` 关系。

### 8.12 `program_source_links.csv`

```csv
school_name,department_name,program_code,program_name,research_direction,exam_year,source_type,title,url,publisher_name,published_at,last_verified_at,status,notes
```

## 9. 可选 JSON 模板

若后续希望减少多张 CSV 之间的人工拆表成本，可追加一个按专业聚合的 JSON 模板：

### 9.1 `program_bundle.json`

```json
{
  "school_name": "示例大学",
  "department_name": "计算机学院",
  "program_code": "081200",
  "program_name": "计算机科学与技术",
  "research_direction": "人工智能",
  "degree_type": "academic",
  "exam_year": 2026,
  "admission": {},
  "score_lines": [],
  "application_stats": {},
  "interview_stats": {},
  "exam_subjects": [],
  "reference_books": [],
  "source_links": []
}
```

建议用法：

1. 采集或人工摘录阶段可先聚合成 JSON。
2. 正式入库前再由脚本展开为标准 CSV 或直接写库。
3. MVP 阶段仍建议把最终导入口统一到 CSV，降低维护复杂度。

## 10. `tools/data-import` 建议脚本结构

当前目录只需规划脚本，不需要现在实现大规模采集器。建议放置以下脚本：

1. `README.md`
   说明目录用途、模板格式、运行顺序、依赖安装方式。
2. `config.example.yaml`
   导入配置示例，如数据库连接、输入目录、年份、试运行开关。
3. `validate_csv.py`
   校验 CSV 列名、必填项、编码、空值、枚举值。
4. `normalize_text.py`
   统一学校名、院系名、专业名、空白字符、标点、日期、布尔值。
5. `build_lookup_tables.py`
   生成学校、院系、专业、科目、图书的映射表，便于关系数据导入。
6. `import_schools.py`
   导入学校。
7. `import_departments.py`
   导入院系。
8. `import_subjects.py`
   导入科目字典。
9. `import_books.py`
   导入图书字典。
10. `import_programs.py`
    导入专业。
11. `import_program_year_data.py`
    统一导入招生、分数线、报录比、复录比。
12. `import_program_exam_subjects.py`
    导入专业考试科目。
13. `import_program_reference_books.py`
    导入专业参考书关系。
14. `import_program_source_links.py`
    导入来源链接。
15. `check_ratios.py`
    反算报录比、复录比并输出异常。
16. `check_source_links.py`
    批量校验链接状态，更新 `active / invalid / pending`。
17. `generate_import_report.py`
    生成导入结果、异常数、跳过数、人工复核项。
18. `run_import.ps1`
    Windows 一键串行执行脚本，适合当前环境。

如果后续增加更完整的中间层，也可再补：

1. `staging_schema.sql`
2. `load_raw_to_staging.py`
3. `promote_staging_to_prod.py`

## 11. 推荐导入执行流程

### 11.1 单批次流程

1. 运营整理原始资料到 `raw/2026/<school>/`
2. 手工录入或脚本抽取到标准 CSV
3. 运行 `validate_csv.py`
4. 运行 `normalize_text.py`
5. 运行 `build_lookup_tables.py`
6. 先导入学校、院系、科目、图书、专业
7. 再导入年度数据、考试科目、参考书关系、来源链接
8. 运行 `check_ratios.py` 与 `check_source_links.py`
9. 输出 `generate_import_report.py`
10. 人工确认异常后再正式导入生产库

### 11.2 试运行建议

1. 每次先用 `--dry-run` 或测试库执行。
2. 先选 3-5 所学校做样本导入。
3. 样本至少覆盖一个学硕、一个专硕、一个多研究方向专业。
4. 样本必须覆盖至少一个存在复录比或参考书差异的复杂专业。

## 12. 最难的导入环节

最难的是“专业粒度标准化 + 年度口径对齐”，尤其体现在以下几个点：

1. 同一学校同一专业会按研究方向拆分招生，是否应拆成多个 `programs` 往往只能靠人工判断。
2. 报录比、复录比经常没有直接官方字段，需要从报名人数、复试名单、拟录取名单反推，口径容易不一致。
3. 考试科目和参考书会随年份变化，且公告可能只改一个科目或只换一个版本，历史追踪容易混乱。
4. 学院更名、专业调整、招生暂停会导致“今年有、明年无”，不能简单按名称覆盖。

因此 MVP 阶段最值得投入的是“标准模板 + 校验脚本 + 人工复核清单”，而不是先做全自动采集。

## 13. MVP 实施建议

1. 首批先覆盖有限院校，优先做结构稳定、信息公开完整的学校。
2. 优先保证 `schools / departments / programs / score_lines / source_links` 五类数据完整。
3. 报录比、复录比、参考书可分批补齐，但缺失状态必须明确可见。
4. 所有导入记录都应能回溯到原始文件路径或来源链接。
5. 在后台为运营保留人工修订入口，避免把所有异常都压给导入脚本。

## 14. 结论

SureGrad 的院校数据导入应以“官方来源优先、标准模板沉淀、脚本校验兜底、人工复核把关”为核心。MVP 阶段先把模板、导入顺序、校验规则和脚本骨架搭好，比先投入大规模采集器更重要，也更符合当前产品阶段。
