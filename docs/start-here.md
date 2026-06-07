# SureGrad Start Here

更新日期：`2026-06-07`

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

1. `AGENTS.md`（Agent 硬性约定与命令速查）
2. `docs/start-here.md`（本文件，当前状态与推进线）
3. `docs/project-plan.md`
4. `docs/prd.md`
5. `docs/api-spec.md`
6. `docs/database-design.md`
7. `docs/schema.sql`

`README.md` 面向 **GitHub 人类读者**（环境、启动、文档索引），Agent 不必优先通读。

这 7 份 Agent 向文件能快速回答 4 个问题：

1. SureGrad 要解决什么问题。
2. MVP 主闭环是什么。
3. 主要数据模型和接口口径是什么。
4. 当前仓库应该沿着什么方向继续，而不是重新发散。

## 3. 按角色补读的文档顺序

### 3.1 主控 / 接班线程

1. `AGENTS.md`
2. `docs/start-here.md`
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

1. 后端：OTP 认证闭环已实现（发送/登录/刷新 + 频率限制 + 测试覆盖）；打卡更新接口已从骨架实现为真实逻辑（归属校验 + 今日限制 + 部分更新 + 连续天数），无剩余骨架响应。
2. 移动端：主路径已经不是纯页面占位，登录拦截、收藏、对比、提醒、Todo/打卡闭环都在继续细化。
3. 后台：已从开发者式样板转向运营工作台表达，并接入了一部分仓库内真实采集数据。
4. 数据导入：校验、规范化、批次报告、dry-run 工具链可验收，且已经有第一批真实采集样例。

## 5. 当前真实数据采集状态

当前仓库里已经落地的真实采集批次位于：

- `tools/data-import/collected/moe-universities-2025`（教育部 2025 全国普通高等学校名单，2919 所学校基础条目）
- `tools/data-import/collected/official-school-websites-2026-06-07`（8 所高校官方主页与研究生招生/研究生院入口补全批次）
- `tools/data-import/collected/ecust-cs-2024`（华东理工 · 081200，数据较完整）
- `tools/data-import/collected/sufe-finance-2024`（上财 · 020204，骨架批次）
- `tools/data-import/collected/zju-cs-2024`（浙大 · 081200，骨架批次）
- `tools/data-import/collected/fudan-finance-2024`（复旦 · 020204，骨架批次）
- `tools/data-import/collected/nju-se-2024`（南大 · 083500，骨架批次）

**ecust-cs-2024** 已含：学校/院系/专业、分数线、招生、复试、初试科目、来源链接等；仍缺报录比、参考书等（见批次 README）。

**moe-universities-2025** 只使用教育部附件字段：学校名称、学校标识码、所在地、办学层次、主管部门和备注；`school_type=未分类`、`has_graduate_school=false`、官网/研究生院空值都是系统占位，不是官方事实。当前已补 `tools/data-import/scripts/parse_moe_universities_2025.py`，可从教育部官方 `.xls` 附件重新生成 `schools.csv`，并校验总数 2919、本科 1365、专科 1554、省级小节计数、学校标识码唯一性和 `name + city` 唯一性。

**official-school-websites-2026-06-07** 已含 8 所学校官方主页与研究生招生/研究生院入口：北京大学、清华大学、北京航空航天大学、北京理工大学、中国农业大学、北京师范大学、南开大学、大连理工大学。该批次只补学校基础字段，不补年度专业数据。

**入库**：`pnpm db:seed:collected` 会先导入教育部 2919 所基础名单，再导入官网补全批次和 5 校精采批次覆盖已逐校核验的官网、研究生院链接和学校类型；`pnpm db:seed:demo` 另含备考资料与管理员。验证：`GET /api/v1/schools` 总数应为 **2919**，官网/研究生入口已核验学校数当前应为 **13**。

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
5. `/schools` 筛选项已接入 `GET /api/v1/admin/schools/facets`，省份、城市、层级、类型、状态选项来自全库聚合，不再只取前 50 条学校记录。
6. 首页已接入 `GET /api/v1/admin/data-coverage`，展示数据库覆盖缺口；本机核验口径：学校总量 2919，已补官网/研究生入口 13，缺官网 2906，缺研究生院 2906，无专业 2914。
7. 如果本地 API 没有把对应接口跑通，学校页和专业页可能出现空态或错误态，这属于联调缺口，不应误判为后台页面完全未做。
8. 后台文案已经在收口到运营视角，后续迭代不要重新把原始 `id`、表名或工程枚举当成前台主信息暴露。

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

## 10. 当前并行推进线（2026-06-07）

1. **OTP 认证闭环**：`OtpService` + `AuthService` + `AuthController` 已落地；支持发送验证码（含冷却 + 每小时频率限制）、验证码登录（自动注册 + 禁用用户拦截）、刷新 token；23 项测试全绿。
2. **打卡更新接口**：`CheckinsService.update` 已从骨架实现为真实逻辑（归属校验 + 仅允许修改今日打卡 + 部分更新 + 连续天数计算）；4 项新增测试；`pnpm verify:api` 104/104 通过。
3. **引导页（Onboarding）**：3 页 PageView 滑动引导（择校/规划/打卡）；"跳过"进游客浏览，"开始使用"进登录页。
4. **首次目标设置页**：新用户登录后自动跳转，收集备考年份、身份类型、目标专业、每日学习时长，调用 `PUT /user-profiles/me` 写入后端。
5. **独立页面拆分**：打卡页、学习统计页、学习路线页已从 Todo/规划页拆分为独立页面，Todo 和规划页通过快捷入口跳转。
6. **真实学校库扩容**：教育部 2025 全国普通高等学校名单 2919 所已生成 `schools.csv` 并接入 `pnpm db:seed:collected`；官网补全批次已将 8 所高校官方主页与研究生入口纳入入库链路；5 校精采批次在其后导入，保留已逐校核验字段。当前只保留 3 条已核实 official 分数线：华东理工 081200=340、上财 025100=389、浙大 081200=350；复旦/南大暂缺分数线，不用错配数字填充。教育部名单已有可复现解析脚本，重新生成 CSV 与仓库版本应保持完全一致。
7. **Admin 视觉验收**：2026-06-07 再次通过 27 张截图；3002 端口后台登录已可用，API 开发环境 CORS 已放行本机 localhost/127.0.0.1 联调端口。同日追加学校全量筛选 facets 验收，确认后台学校页能显示 `2919`、`广东省 (166)`、`专科 (1554)`、`未分类 (2914)`；追加数据库覆盖缺口看板验收，确认首页显示 `2919`、`2906`、`13` 等真实库内聚合数字。
8. **Mobile 视觉验收**：21 项测试全绿，mobile + tablet 双视口确认无问题。
9. **数据准确性原则**：所有采集数据严格区分 `official`（可溯源）与 `estimated`（待核实），不猜测数字。

## 11. 下一步工作建议

### 11.1 主控线程优先项

1. 继续把详细工作分发给子线程，主控自己重点负责验收、统一口径、文档同步和推送时机控制。
2. 每轮先看这份入口，再看 `git status` 和最近提交，确认本轮真正变化了什么。
3. 出现大版本变动时，把变化写回本文件，而不是只留在聊天记录里。

### 11.2 后台 / 后端联调优先项

1. OTP 认证链路已完整（发送 + 登录 + 刷新），下一步可对接移动端真实登录流程或接入第三方短信服务。
2. 继续打通 `programs` 相关真实接口，减少后台专业页对空态的依赖。
3. 继续细化 `GET /admin/data-coverage`，下一步可补“按省份/学校分组的待补官网队列”和“按专业分组的年度数据缺口”。
4. 坚持运营表达，不让后台重新退化成开发者控制台。

### 11.3 移动端 / 视觉验收优先项

1. 专业详情页已落地；**资料详情页**已落地（2026-05-23）。ecust 批次已补招生/复试/初试科目 CSV（2026-05-23）。下一步优先补齐 `program_application_stats`（报录比，需官方报考人数）或参考书模板，减少详情与对比中的「待补充」。
2. 任何涉及 Flutter 页面结构或交互的改动，除 `flutter analyze` / `flutter test` 外，应跑 `pnpm verify:visual` 并写 `docs/visual-qa/` 记录。

### 11.4 数据采集优先项

1. 官网/研究生入口下一批建议继续按官方站点补重点高校；当前 coverage 显示 2919 所中仍有 2906 所缺官网/研究生入口。
2. 每个真实批次都必须带批次 README、来源链接和可复核时间。
3. 采集完成后至少跑一遍 `validate_csv.py`，并把结果能否通过写回文档。

## 12. 新线程提示词最低要求

如果后续还会继续开新对话，提示词里至少要写清：

1. 先读 `AGENTS.md` 与 `docs/start-here.md`
2. 工作区路径统一使用 `C:\Users\hp\Documents\SureGrad`
3. 再按模块补读对应文档
4. 不要依赖聊天记录恢复现场
5. 完成后同步更新文档
