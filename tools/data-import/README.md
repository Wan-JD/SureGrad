# SureGrad 数据导入工具骨架

这个目录承接 SureGrad 院校数据导入链路的前置环节。当前范围是：

1. 标准 CSV 模板
2. 编码、字段、枚举、格式校验
3. 文本规范化
4. 批次级跨文件关联校验
5. 批次级导入报告生成
6. Windows dry-run 串行执行和 JSON / Markdown 报告
7. PostgreSQL 批次入库（`import_to_db.py`，ecust 五表最小闭环）

数据库写入已支持 ecust 批次五表（`schools` → `departments` → `programs` → `program_score_lines` → `program_source_links`），其它模板后续按同模式扩展。

在继续改这一条线之前，先读：

1. `docs/start-here.md`
2. `docs/data-import-plan.md`
3. `docs/database-design.md`
4. `docs/schema.sql`

## 0. 当前真实采集状态

当前仓库已经落地一批人工核验过的真实采集样例：

`tools/data-import/collected/ecust-cs-2024`

当前批次包含：

1. `schools.csv`
2. `departments.csv`
3. `programs.csv`
4. `program_score_lines.csv`
5. `program_source_links.csv`

覆盖范围：

1. 学校：华东理工大学
2. 年份：`2024`
3. 专业：`081200 计算机科学与技术`

当前批次说明：

1. 已附带批次级 `README.md`，记录官方来源与人工假设。
2. 这一轮优先保证真源、来源追溯和模板链路跑通，不先猜测缺失数字。
3. ecust 批次已包含 `program_admissions`、`program_interview_stats`、`subjects`、`program_exam_subjects`；仍缺 `program_application_stats`、`program_reference_books`、`books` 等模板内容。

因此，当前数据导入线并不是“还没开始采”，而是已经进入“继续扩批次、补模板、接入后台与后端”的阶段。

## 1. 真源与口径

字段命名与约束优先级：

1. `docs/schema.sql`：最终字段名、枚举、非空和数值范围
2. `docs/data-import-plan.md`：模板用途、业务口径、执行流程
3. `docs/database-design.md`：表含义与业务解释

补充说明：

1. 直接落业务表的字段尽量与 `schema.sql` 同名。
2. `school_name`、`department_name`、`program_code` 这类字段是导入前的定位辅助键。
3. `program_exam_subjects.csv` 当前使用 `subject_code` 作为标准科目映射键，对应 `subjects.code`；它等价于方案文档里的 `subject_dict_code`。
4. `program_source_links.csv` 当前已经显式包含 `source_confidence`，便于把官方、估算、人工补录区分开。

## 2. 目录结构

```text
tools/data-import/
|-- README.md
|-- collected/
|-- config.collected-ecust-cs-2024.yaml
|-- config.example.yaml
|-- config.valid-batch.yaml
|-- csv_specs.py
|-- generate_import_report.py
|-- normalize_text.py
|-- run_import.ps1
|-- validate_csv.py
|-- templates/
|-- samples/
|   |-- valid-batch/
|   `-- invalid-batch/
`-- .out/                # 运行输出目录，默认不提交
```

`collected/` 用于存放已经人工核验过的真实采集批次。每个批次单独建目录，并附带一份 `README.md` 说明来源、范围和人工假设。

## 3. 模板列表

当前模板和 `docs/data-import-plan.md` 保持一致：

1. `schools.csv`
2. `departments.csv`
3. `subjects.csv`
4. `books.csv`
5. `programs.csv`
6. `program_admissions.csv`
7. `program_score_lines.csv`
8. `program_application_stats.csv`
9. `program_interview_stats.csv`
10. `program_exam_subjects.csv`
11. `program_reference_books.csv`
12. `program_source_links.csv`

## 4. 当前已实现能力

### 4.1 `validate_csv.py`

单文件校验：

1. UTF-8 / UTF-8 with BOM
2. 文件名是否合法
3. Header 是否匹配模板
4. 必填字段是否为空
5. 枚举值是否合法
6. int / decimal / bool / date / datetime / URL 格式是否合法
7. 文件内唯一键是否重复
8. 报录比、复录比、复试权重是否触发人工复核 warning

批次级跨文件校验：

1. `departments -> schools`
2. `programs -> schools + departments`
3. 年度表、科目表、来源表、参考书表 -> `programs`
4. `program_exam_subjects -> subjects`
5. `program_reference_books -> books`
6. `program_reference_books.subject_role -> program_exam_subjects`
7. 每条年度数据是否能在 `program_source_links.csv` 找到同 program/year 的来源链接

`program_source_links.csv` 额外强约束：

1. `exam_year`、`last_verified_at`、`status`、`source_confidence` 必填
2. `status` 仅允许 `active / invalid / pending`
3. `source_confidence` 仅允许 `official / estimated / manual`
4. `published_at` 不得晚于 `last_verified_at`
5. `status=invalid` 时必须补 `notes`

输出约定：

1. `ERROR`：阻塞后续处理，退出码 `1`
2. `WARNING`：提示人工复核，退出码仍为 `0`
3. 可选 `--report-file`：输出稳定 JSON 报告

### 4.2 `normalize_text.py`

当前规范化项：

1. Unicode `NFKC`
2. 去首尾空格、重复空白、换行
3. `-- / 暂无 / 待定 / 未公布 / 无` 等占位值转空
4. 布尔值统一为 `true / false`
5. 日期统一为 `YYYY-MM-DD`
6. 无时区时间补为 `+08:00`
7. URL 去掉常见跟踪参数和片段

输出约定：

1. 终端打印每个文件的 `rows` 与 `changed_cells`
2. 可选 `--report-file`：输出稳定 JSON 报告

### 4.3 `run_import.ps1`

当前 dry-run 顺序：

1. 校验原始 CSV
2. 规范化到 `.out/...`
3. 再校验规范化结果
4. 生成批次级 `import-report.json` 和 `import-report.md`
5. 汇总写出 `.out/reports/*.json`

当 `execution.dry_run=false` 且配置包含 `database` 时，会额外执行第 6 步：`import_to_db.py` 写入 PostgreSQL，并生成 `import-log.json`。

补充说明：

1. 如果配置里提供了 `files` 列表，`run_import.ps1` 会只处理这些 CSV，而不是盲扫整个目录。
2. `config.collected-ecust-cs-2024.yaml` 用于 dry-run 校验；`config.import-ecust-cs-2024.yaml` 用于校验后入库。

### 4.4 `import_to_db.py`

前置条件：

1. 本机 PostgreSQL 已创建库（默认 `suregrad`）。
2. 已执行 `docs/schema.sql`。
3. 已安装 Python 依赖：`pip install -r tools/data-import/requirements.txt`

推荐命令（仓库根目录）：

```powershell
# 仅入库（假定 CSV 已通过校验）
pnpm db:import:ecust

# 校验 + 规范化 + 报告 + 入库
powershell -ExecutionPolicy Bypass -File tools/data-import/run_import.ps1 -ConfigPath tools/data-import/config.import-ecust-cs-2024.yaml
```

环境变量可覆盖 `database` 配置：`DATABASE_HOST`、`DATABASE_PORT`、`DATABASE_NAME`、`DATABASE_USER`、`DATABASE_PASSWORD`。

### 4.5 迁移（已有旧库时）

若库表由早期 TypeORM 自动同步生成、缺少 `program_source_links.source_confidence` 等列，先执行：

```powershell
pnpm db:migrate
pnpm db:import:ecust
```

或一条命令：`pnpm db:seed:ecust`（等价于 migrate + import）。

全新库仍建议先 `docs/schema.sql`，再 `pnpm db:import:ecust`。

## 5. Dry-Run 用法

在仓库根目录执行：

### 5.1 空模板自检

```powershell
python tools/data-import/validate_csv.py tools/data-import/templates --require-all-templates
python tools/data-import/normalize_text.py --input tools/data-import/templates --output-dir tools/data-import/.out/normalized
powershell -ExecutionPolicy Bypass -File tools/data-import/run_import.ps1 -ConfigPath tools/data-import/config.example.yaml
```

### 5.2 有效样例批次

```powershell
python tools/data-import/validate_csv.py tools/data-import/samples/valid-batch --require-all-templates
python tools/data-import/normalize_text.py --input tools/data-import/samples/valid-batch --output-dir tools/data-import/.out/valid-batch-normalized
python tools/data-import/validate_csv.py tools/data-import/.out/valid-batch-normalized --require-all-templates
powershell -ExecutionPolicy Bypass -File tools/data-import/run_import.ps1 -ConfigPath tools/data-import/config.valid-batch.yaml
```

预期结果：

1. `valid-batch` 校验通过
2. `run_import.ps1` 四步通过
3. `.out/reports/` 下生成：
   `validate-source.json`、`normalize.json`、`validate-normalized.json`、`import-report.json`、`import-report.md`、`dry-run-report.json`

### 5.3 真实采集批次 dry-run

```powershell
powershell -ExecutionPolicy Bypass -File tools/data-import/run_import.ps1 -ConfigPath tools/data-import/config.collected-ecust-cs-2024.yaml
```

预期结果：

1. `ecust-cs-2024` 在部分模板模式下校验通过
2. `.out/reports/ecust-cs-2024/` 下生成完整批次报告
3. `import-report.json` 能直接看见学校、年份、模板覆盖和人工复核项

### 5.4 无效样例批次

```powershell
python tools/data-import/validate_csv.py tools/data-import/samples/invalid-batch --require-all-templates
```

当前预期结果：

1. 返回非零退出码
2. 稳定输出 `11 errors / 1 warning`
3. 错误覆盖 URL、枚举、重复键、跨文件 program 关联、subject/book 关联、source link 字段约束

## 6. 样例批次说明

### 6.1 `samples/valid-batch/`

用于验证：

1. 全模板联动是否能过
2. 规范化后是否仍然可再次通过校验
3. 年度数据、考试科目、参考书、来源链接是否能串起来

### 6.2 `samples/invalid-batch/`

用于稳定触发：

1. URL 错误
2. 枚举值错误
3. 日期格式错误
4. 唯一键重复
5. 年度表引用不存在的 program
6. 科目字典映射错误
7. 图书与科目角色关联错误
8. 来源链接状态/可信度错误
9. 报录比人工复核 warning

## 7. 当前未覆盖的能力

仍然缺少：

1. `build_lookup_tables.py`
2. `import_schools.py`
3. `import_departments.py`
4. `import_subjects.py`
5. `import_books.py`
6. `import_programs.py`
7. 年度数据入库脚本
8. 考试科目与参考书关系入库脚本
9. 来源链接巡检脚本
10. 正式数据库导入执行器

所以这里现在是“可验收的前置工具链 + 批次报告层”，还不是“可入库的完整导入器”。

## 8. 下一步建议

推荐按以下顺序继续：

1. 第二批次骨架：`collected/sufe-finance-2024`（`config.collected-sufe-finance-2024.yaml` 可 dry-run）；入库前需补全分数线与缺失模板。
2. 继续补齐 `ecust-cs-2024` / `sufe-finance-2024` 缺失模板并复核数字字段。
2. 每个批次都要保留来源链接、核验时间和批次 README。
3. 采集完成后至少跑一次 `run_import.ps1`，让 `import-report.json` 和 `import-report.md` 一起沉淀下来。
4. 后续补正式导入器时，保持 `schema.sql` 作为字段与约束的事实来源。
