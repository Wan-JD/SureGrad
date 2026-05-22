# SureGrad Start Here

更新日期：`2026-05-23`

这份文档是 SureGrad 当前仓库的统一接班入口。

适用场景：

1. 新开 Codex 对话，需要先恢复上下文。
2. 主控线程需要审阅当前仓库，再决定下一轮分工。
3. 子线程只负责某个模块，但不想再从聊天记录里拼现场。

## 1. 先记住这 4 条

1. 项目主名统一为 `SureGrad`。
2. 本地工作区路径统一使用 `C:\Users\hp\Documents\SureGrad`。
3. 新对话先读文档，再看 `git status`，不要依赖聊天记录恢复现场。
4. 每一轮迭代结束后同步更新文档，至少把“当前状态、已知缺口、下一步建议”写回仓库。

## 2. 新对话最小必读清单

如果只允许先读 15 分钟，按这个顺序：

1. `docs/start-here.md`
2. `README.md`
3. `docs/project-plan.md`
4. `docs/prd.md`
5. `docs/api-spec.md`
6. `docs/database-design.md`
7. `docs/schema.sql`

这 7 份文件能快速回答 4 个问题：

1. SureGrad 要解决什么问题。
2. MVP 主闭环是什么。
3. 主要数据模型和接口口径是什么。
4. 当前仓库应该沿着什么方向继续，而不是重新发散。

## 3. 按角色补读的文档顺序

### 3.1 主控 / 接班线程

1. `docs/start-here.md`
2. `README.md`
3. `docs/project-plan.md`
4. `docs/prd.md`
5. `docs/api-spec.md`
6. `docs/database-design.md`
7. `docs/schema.sql`
8. `docs/codex-session-prompts.md`
9. `apps/admin/README.md`
10. `tools/data-import/README.md`

### 3.2 后端线程

1. `docs/start-here.md`
2. `docs/prd.md`
3. `docs/api-spec.md`
4. `docs/database-design.md`
5. `docs/schema.sql`
6. `docs/backend-architecture.md`

### 3.3 移动端线程

1. `docs/start-here.md`
2. `docs/prd.md`
3. `docs/ux-flow.md`
4. `docs/api-spec.md`
5. `docs/mobile-architecture.md`

### 3.4 后台线程

1. `docs/start-here.md`
2. `docs/prd.md`
3. `docs/database-design.md`
4. `docs/schema.sql`
5. `docs/data-import-plan.md`
6. `apps/admin/README.md`

### 3.5 数据采集 / 导入线程

1. `docs/start-here.md`
2. `docs/data-import-plan.md`
3. `docs/database-design.md`
4. `docs/schema.sql`
5. `tools/data-import/README.md`
6. `tools/data-import/collected/*/README.md`

## 4. 当前仓库快照

当前默认协作基线以 `main` 为准；新线程接手时先执行 `git status -sb` 和 `git log --oneline --decorate --max-count=5`，不要拿旧聊天记录里的分支名当现状。

最近几轮已经推进到“骨架之上继续补真实联调与真实数据”的阶段，方向上不是从零搭架子，而是继续把以下 4 条线收实：

1. 后端：在文档口径下逐步把部分接口从 skeleton 推进到真实实现。
2. 移动端：主路径已经不是纯页面占位，登录拦截、收藏、对比、提醒、Todo/打卡闭环都在继续细化。
3. 后台：已从开发者式样板转向运营工作台表达，并接入了一部分仓库内真实采集数据。
4. 数据导入：校验、规范化、批次报告、dry-run 工具链可验收，且已经有第一批真实采集样例。

## 5. 当前真实数据采集状态

当前仓库里已经落地的真实采集批次位于：

`tools/data-import/collected/ecust-cs-2024`

当前批次包含：

1. `schools.csv`
2. `departments.csv`
3. `programs.csv`
4. `program_score_lines.csv`
5. `program_source_links.csv`

覆盖对象：

1. 学校：华东理工大学
2. 年份：`2024`
3. 专业：`081200 计算机科学与技术`

当前批次特点：

1. 已附带批次级 `README.md`，说明官方来源和人工判断。
2. 已优先保证真源和来源追溯，而不是先把所有字段补满。
3. 现在可以直接通过 `tools/data-import/run_import.ps1` 产出批次级 `import-report.json` 和 `import-report.md`。
4. 当前真实批次还没有覆盖 `program_admissions`、`program_application_stats`、`program_interview_stats`、`program_exam_subjects`、`program_reference_books`、`subjects`、`books` 等模板。

**入库（2026-05-22）**：ecust 五表可通过 `pnpm db:seed:ecust` 写入 PostgreSQL（`db:migrate` + `db:import:ecust`）。全新库先执行 `docs/schema.sql`；旧库缺列时 migrate 会补齐。本机验证：`GET /api/v1/schools` 应返回华东理工大学及 2024 分数线摘要。

**备考资料演示（2026-05-22）**：不扩大院校 CSV 采集时，可用 `pnpm db:seed:resources` 幂等写入 4 门 `subjects`（政治/英语/数学/专业课）与 6 条 `study_resources`（固定 UUID，`is_public_legal=true`、`status=active`）。与 ecust 一并演示可跑 `pnpm db:seed:demo`。本机验证：`GET /api/v1/study-resources` 应返回 ≥6 条公开合法资料。

这意味着当前数据线的重点不是“有没有开始采”，而是：

1. 扩大批次数量。
2. 补齐单批次缺失模板。
3. 确保本地 PostgreSQL schema 与 `docs/schema.sql` 一致后，让 Admin/API 读到库内数据（不仅是 CSV 文件）。

## 6. 当前后台现状

`apps/admin` 当前已经不是纯静态骨架，至少有以下状态需要新线程知道：

1. 首页 `/` 会直接读取 `tools/data-import/collected`，显示真实采集批次概览。
2. `/source-links` 会优先展示已采集真实批次中的来源链接。
3. `/yearly-data` 会优先展示已采集真实批次中的年份数据；当前真实接入最明确的是分数线页签。
4. `/schools` 和 `/programs` 已经走真实 API 工作台思路，默认请求 `NEXT_PUBLIC_ADMIN_API_BASE_URL`，默认值是 `http://localhost:3000/api/v1`。
5. 如果本地 API 没有把对应接口跑通，学校页和专业页可能出现空态或错误态，这属于联调缺口，不应误判为后台页面完全未做。
6. 后台文案已经在收口到运营视角，后续迭代不要重新把原始 `id`、表名或工程枚举当成前台主信息暴露。

## 7. 当前文档更新纪律

从这一轮开始，建议把下面 3 项当成硬约束：

1. 每轮功能迭代后，至少同步更新一个能反映当前状态的文档入口。
2. 任何新线程如果发现“代码已变、文档未变”，优先补文档再继续扩写提示词。
3. 主控线程在分发任务前，先确认子线程需要读哪几份文档，并把阅读顺序写进提示词。

## 8. 当前工程健康度

截至 `2026-05-20`，仓库主干的基础校验已经可以整套跑通：

1. `services/api`：`pnpm build:api`、`pnpm lint:api`、`pnpm test:api`
2. `apps/admin`：`pnpm build:admin`、`pnpm lint:admin`
3. `apps/mobile`：`pnpm analyze:mobile`、`pnpm test:mobile`

本轮同时补上了仓库级入口与自动守门：

1. 根目录新增 `pnpm verify`、`pnpm verify:api`、`pnpm verify:admin`、`pnpm verify:mobile`
2. `.github/workflows/ci.yml` 已覆盖 `main` 推送和 Pull Request 的 API、Admin、Mobile 校验

这意味着后续线程如果做了跨模块改动，默认应至少给出对应模块级验证结果，而不是只报局部页面或单个接口“看起来能用”。

## 9. 默认验收规则

1. 后台和移动端只要涉及页面改动，就不能只看构建或静态检查；**必须由 agent 自行截图验收**（`pnpm verify:visual` → `docs/.visual-qa/` + `docs/visual-qa/*.md`）。
2. 一轮工作 **合格** = 工程校验通过 + 视觉验收通过；合格后 **自动 push** 到 GitHub（提交禁止任何 AI/agent 署名，见 `.cursor/rules/git-commits.mdc`）。
3. 新线程如果明显匹配某个 skill 的职责范围，应先用 skill 再展开具体工作。
4. 文档、代码、真实采集数据三条线都要回写现状，不能把关键信息只留在聊天记录里。

## 10. 当前并行推进线（2026-05-22）

1. **移动端专业详情**：`/programs/detail` 对接 `GET /programs/{id}`，院校详情可跳转；视觉见 `docs/visual-qa/2026-05-22-program-detail-round.md`
2. **响应式布局**：Admin 1080px 抽屉 + 720px 表格卡片化；Mobile `NavigationRail`（≥600px）+ `ResponsivePageBody`
3. **视觉验收**：`capture-admin.mjs` 每页 desktop/tablet/mobile；`run-mobile-visual.mjs` 含 `mobile-program-detail`
4. **备考资料演示**：`pnpm db:seed:resources` / `db:seed:demo`；Admin `/resources` Live API
5. **API**：`study-resources` 分页 COUNT 修复；延续 reminders、对比、游客冷启动等

## 11. 下一步工作建议

### 11.1 主控线程优先项

1. 继续把详细工作分发给子线程，主控自己重点负责验收、统一口径、文档同步和推送时机控制。
2. 每轮先看这份入口，再看 `git status` 和最近提交，确认本轮真正变化了什么。
3. 出现大版本变动时，把变化写回本文件，而不是只留在聊天记录里。

### 11.2 后台 / 后端联调优先项

1. 继续打通 `schools`、`programs` 相关真实接口，减少后台学校页和专业页对空态的依赖。
2. 让后台看到的不只是“批次文件存在”，还要能继续看到“哪些模板缺、哪些年份缺、哪些字段待补”。
3. 坚持运营表达，不让后台重新退化成开发者控制台。

### 11.3 移动端 / 视觉验收优先项

1. 专业详情页已落地；下一步优先 **资料详情页** 或补齐 ecust 报录比/复试 CSV，减少详情与对比中的「待补充」。
2. 任何涉及 Flutter 页面结构或交互的改动，除 `flutter analyze` / `flutter test` 外，应跑 `pnpm verify:visual` 并写 `docs/visual-qa/` 记录。

### 11.4 数据采集优先项

1. 可以分发独立子线程采第二所学校或扩充现有学校更多专业。
2. 每个真实批次都必须带批次 README、来源链接和可复核时间。
3. 采集完成后至少跑一遍 `validate_csv.py`，并把结果能否通过写回文档。

## 12. 新线程提示词最低要求

如果后续还会继续开新对话，提示词里至少要写清：

1. 先读 `docs/start-here.md`
2. 工作区路径统一使用 `C:\Users\hp\Documents\SureGrad`
3. 再按模块补读对应文档
4. 不要依赖聊天记录恢复现场
5. 完成后同步更新文档
