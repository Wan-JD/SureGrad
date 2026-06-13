# SureGrad Start Here

更新日期：`2026-06-12`（211 计算机采集批次补充）

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
- `tools/data-import/collected/official-school-websites-2026-06-08`（从 2026-06-08 本地原始材料中筛出的 31 所重点高校官方主页与研究生入口补全批次，当前接入入库链路）
- `tools/data-import/collected/ecust-cs-2024`（华东理工 · 081200，数据较完整）
- `tools/data-import/collected/sufe-finance-2024`（上财 · 020204，骨架批次）
- `tools/data-import/collected/zju-cs-2024`（浙大 · 081200，骨架批次）
- `tools/data-import/collected/fudan-finance-2024`（复旦 · 020204，骨架批次）
- `tools/data-import/collected/nju-se-2024`（南大 · 083500，骨架批次）
- `tools/data-import/collected/tsinghua-sem-finance-2026`（清华经管 · 025100 金融，2026 年最小清洗闭环批次）
- `tools/data-import/collected/njust-cs-2024`（南理工 · 081200/083500/085404/085405/085410/085411，211 计算机多专业批次）
- `tools/data-import/collected/hnu-cs-2024`（湖大 · 081200/085404/085405/085410/085411/085412，985 计算机多专业批次）
- `tools/data-import/collected/bjtu-cs-2024`（北交大 · 081200/083500/085404/085410，211 计算机多专业批次）
- `tools/data-import/collected/hfut-cs-2025`（合工大 · 081200/085404/085405/085410，211 计算机多专业批次，2025 考试年份/2026 入学）
- `tools/data-import/collected/xidian-cs-2024`（西电 · 081200/083900/085404/085412，211 计算机多专业批次，含报录比）
- `tools/data-import/collected/jnu-cs-2024`（暨大 · 081200/085404，211 计算机批次，含学院级复试线）

**ecust-cs-2024** 已含：学校/院系/专业、分数线、招生、复试、初试科目、来源链接等；仍缺报录比、参考书等（见批次 README）。

**moe-universities-2025** 只使用教育部附件字段：学校名称、学校标识码、所在地、办学层次、主管部门和备注；`school_type=未分类`、`has_graduate_school=false`、官网/研究生院空值都是系统占位，不是官方事实。当前已补 `tools/data-import/scripts/parse_moe_universities_2025.py`，可从教育部官方 `.xls` 附件重新生成 `schools.csv`，并校验总数 2919、本科 1365、专科 1554、省级小节计数、学校标识码唯一性和 `name + city` 唯一性。

**official-school-websites-2026-06-07** 已含 8 所学校官方主页与研究生招生/研究生院入口：北京大学、清华大学、北京航空航天大学、北京理工大学、中国农业大学、北京师范大学、南开大学、大连理工大学。该批次只补学校基础字段，不补年度专业数据。

**official-school-websites-2026-06-08** 已含 31 所重点高校官方主页与研究生招生/研究生院入口：在 6 月 7 日 8 校基础上，新增天津大学、哈尔滨工业大学、上海交通大学、复旦大学、东南大学、南京大学、厦门大学、山东大学、四川大学、武汉大学、华中科技大学、湖南大学、同济大学、华东师范大学、中山大学、吉林大学、北京邮电大学、西安电子科技大学、中南大学、西安交通大学、电子科技大学、西北工业大学、中国科学技术大学等学校。该批次只补学校基础字段，不补年度专业数据。

2026-06-08 本地原始材料中，学校官网字段已拆入 `official-school-websites-2026-06-08`；专业来源、分数线、考试科目等 CSV 仍缺完整 `departments.csv` / `programs.csv` 关联，且含 `estimated` 分数线，当前不得接入 `pnpm db:seed:collected`。

`tools/data-import/collected/import-ready-batches.json` 是当前已验收、已接入入库链路的批次清单。Admin 采集批次、来源链接和年份数据统计只读取该清单内目录；`official-school-materials-2026-06-08-batch-1` 这类候选材料清洗通过前不得加入该清单。

**2026-06-12 数据小闭环补充**：已从 `official-school-materials-2026-06-08-batch-1` 中抽出清华大学经济管理学院 `025100 金融` 2026 年线索，重新核验为独立清洗批次 `tsinghua-sem-finance-2026`。该批次只保留官方来源确认的数据：招生目录、学院复试录取实施细则、招生简章附件 PDF；包含 1 所学校、1 个院系、1 个专业、1 条招生计划、1 条 official 复试分数线、4 条初试科目、3 条来源链接。原候选材料中的清华金融 `369/60/60/85/85` 未能由官方页面确认，未纳入；学制未核到单一数字，`duration_years` 留空。`validate_csv.py`、`run_import.ps1` 和 `pnpm db:seed:collected` 均已通过。

**2026-06-12 211 计算机采集批次补充**：本轮新增 3 个 211/985 计算机相关清洗批次，全部通过 `validate_csv.py`、`run_import.ps1` 和 `pnpm db:seed:collected`：

1. **njust-cs-2024**（南京理工大学）：6 个专业（081200/083500/085404/085405/085410/085411），含招生计划、复试分数线（学院级）、进入复试人数/拟录取人数（报录比口径）、13 条来源链接。数据来源：计算机科学与工程学院复试录取工作实施细则（cs.njust.edu.cn）与研究生院统一分数线公告。
2. **hnu-cs-2024**（湖南大学）：6 个专业（081200/085404/085405/085410/085411/085412），含学校统一复试分数线（含单科线）、初试科目（408 统考）、学制学费、12 条来源链接。数据来源：研究生院复试分数线公告（gra.hnu.edu.cn）与招生简章。
3. **bjtu-cs-2024**（北京交通大学）：4 个专业（081200/083500/085404/085410），含招生计划（含推免）、初试科目（408 统考）、4 条来源链接。数据来源：2025 年入学招生专业目录 PDF（yzb.bjtu.edu.cn）。

三个批次均缺报录比（官方未公开报考人数）、参考书；BJTU 和 HNU 暂缺学院级复试线（BJTU 官网不可访问、HNU 学院页面为图片格式）。

**入库**：`pnpm db:seed:collected` 会先导入教育部 2919 所基础名单，再依次导入官网补全批次、`tsinghua-sem-finance-2026`、5 校精采批次、`njust-cs-2024`、`hnu-cs-2024`、`bjtu-cs-2024`；`pnpm db:seed:demo` 另含备考资料与管理员。验证：`GET /api/v1/schools` 总数应为 **2919**。

**备考资料演示（2026-05-22）**：不扩大院校 CSV 采集时，可用 `pnpm db:seed:resources` 幂等写入 4 门 `subjects`（政治/英语/数学/专业课）与 6 条 `study_resources`（固定 UUID，`is_public_legal=true`、`status=active`）。与 ecust 一并演示可跑 `pnpm db:seed:demo`。本机验证：`GET /api/v1/study-resources` 应返回 ≥6 条公开合法资料。

这意味着当前数据线的重点不是“有没有开始采”，而是：

1. 扩大批次数量。
2. 补齐单批次缺失模板。
3. 确保本地 PostgreSQL schema 与 `docs/schema.sql` 一致后，让 Admin/API 读到库内数据（不仅是 CSV 文件）。

## 6. 当前后台现状

`apps/admin` 当前已经不是纯静态骨架，至少有以下状态需要新线程知道：

1. 首页 `/` 会读取 `tools/data-import/collected/import-ready-batches.json`，只显示已验收、已接入入库链路的真实采集批次概览。
2. `/source-links` 会优先展示已验收真实批次中的来源链接。
3. `/yearly-data` 会优先展示已验收真实批次中的年份数据；当前真实接入最明确的是分数线页签。
4. `/schools` 和 `/programs` 已经走真实 API 工作台思路，默认请求 `NEXT_PUBLIC_ADMIN_API_BASE_URL`，默认值是 `http://localhost:3000/api/v1`。
5. `/schools` 筛选项已接入 `GET /api/v1/admin/schools/facets`，省份、城市、层级、类型、状态选项来自全库聚合，不再只取前 50 条学校记录。
6. 首页已接入 `GET /api/v1/admin/data-coverage`，展示数据库覆盖缺口；本机核验口径：学校总量 2919，已补官网/研究生入口 34，缺官网 2885，缺研究生院 2885，无专业 2914。2026-06-12 又补充了 `priorityGaps`，返回省份官网缺口、学校入口补全队列和专业年度数据缺口 Top 列表，后台首页会直接展示这些下一步补数入口。
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

1. **账号密码认证主流程**：移动端主流程已切到手机号/邮箱 + 密码；`POST /auth/register` 仅注册使用图形验证码，密码以 `scrypt` 哈希存储；已有账号重复注册返回 `ACCOUNT_EXISTS`；`POST /auth/login/password` 支持手机号或邮箱登录。OTP 与旧图形验证码登录接口保留兼容，但不再是移动端主入口；`pnpm verify:api` 120/120 通过。
2. **打卡更新接口**：`CheckinsService.update` 已从骨架实现为真实逻辑（归属校验 + 仅允许修改今日打卡 + 部分更新 + 连续天数计算）；4 项新增测试。
3. **引导页（Onboarding）**：3 页 PageView 滑动引导（择校/规划/打卡）；"跳过"进游客浏览，"开始使用"进登录页。
4. **首次目标设置页**：新用户登录后自动跳转，收集备考年份、身份类型、目标专业、每日学习时长，调用 `PUT /user-profiles/me` 写入后端。
5. **独立页面拆分**：打卡页、学习统计页、学习路线页已从 Todo/规划页拆分为独立页面，Todo 和规划页通过快捷入口跳转。
6. **真实学校库扩容**：教育部 2025 全国普通高等学校名单 2919 所已生成 `schools.csv` 并接入 `pnpm db:seed:collected`；官网补全批次已从 8 校扩到 31 校重点高校，并纳入入库链路；清华经管 2026 金融最小清洗批次和 5 校精采批次在其后导入，保留已逐校核验字段。当前只保留 4 条已核实 official 分数线：华东理工 081200=340、上财 025100=389、浙大 081200=350、清华经管 025100=385；复旦/南大暂缺分数线，不用错配数字填充。教育部名单已有可复现解析脚本，重新生成 CSV 与仓库版本应保持完全一致。
7. **Admin 视觉验收**：2026-06-07 再次通过 27 张截图；3002 端口后台登录已可用，API 开发环境 CORS 已放行本机 localhost/127.0.0.1 联调端口。同日追加学校全量筛选 facets 验收，确认后台学校页能显示 `2919`、`广东省 (166)`、`专科 (1554)`、`未分类 (2914)`；追加数据库覆盖缺口看板验收，确认首页显示 `2919`、`2906`、`13` 等真实库内聚合数字。2026-06-12 coverage 看板已从总数指标扩展到优先缺口短榜，待补视觉验收记录。
8. **Mobile 认证与视觉验收**：登录页已改为“登录/注册”分段；登录只需账号密码，注册需图形验证码；个人中心统一显示账号标签；Flutter 22 项测试全绿，后续本轮视觉记录见 `docs/visual-qa/`。
9. **数据准确性原则**：所有采集数据严格区分 `official`（可溯源）与 `estimated`（待核实），不猜测数字。

## 11. 下一步工作建议

### 11.1 主控线程优先项

1. 继续把详细工作分发给子线程，主控自己重点负责验收、统一口径、文档同步和推送时机控制。
2. 每轮先看这份入口，再看 `git status` 和最近提交，确认本轮真正变化了什么。
3. 出现大版本变动时，把变化写回本文件，而不是只留在聊天记录里。

### 11.2 后台 / 后端联调优先项

1. 账密认证链路已完整（注册 + 登录 + 刷新 + 重复注册拦截），后台 App 用户列表支持按手机号、邮箱或昵称搜索；下一步可补“忘记密码/重置密码”闭环。
2. 继续打通 `programs` 相关真实接口，减少后台专业页对空态的依赖。
3. `GET /admin/data-coverage` 已补“按省份/学校分组的待补官网队列”和“按专业分组的年度数据缺口”；下一步优先用这三组 `priorityGaps` 驱动真实补数批次和 Admin 筛选跳转，而不是继续只看总数。
4. 坚持运营表达，不让后台重新退化成开发者控制台。

### 11.3 移动端 / 视觉验收优先项

1. 专业详情页已落地；**资料详情页**已落地（2026-05-23）。ecust 批次已补招生/复试/初试科目 CSV（2026-05-23）。下一步优先补齐 `program_application_stats`（报录比，需官方报考人数）或参考书模板，减少详情与对比中的「待补充」。
2. 任何涉及 Flutter 页面结构或交互的改动，除 `flutter analyze` / `flutter test` 外，应跑 `pnpm verify:visual` 并写 `docs/visual-qa/` 记录。

### 11.4 数据采集优先项

1. 官网/研究生入口下一批建议继续按官方站点补重点高校；当前 coverage 显示 2919 所中仍有 2885 所缺官网/研究生入口。
2. 每个真实批次都必须带批次 README、来源链接和可复核时间。
3. 采集完成后至少跑一遍 `validate_csv.py`，并把结果能否通过写回文档。
4. 新批次只有在 CSV 校验通过、导入配置跑通、且写入 `import-ready-batches.json` 后，才算进入 Admin 运营统计口径。

## 12. 新线程提示词最低要求

如果后续还会继续开新对话，提示词里至少要写清：

1. 先读 `AGENTS.md` 与 `docs/start-here.md`
2. 工作区路径统一使用 `C:\Users\hp\Documents\SureGrad`
3. 再按模块补读对应文档
4. 不要依赖聊天记录恢复现场
5. 完成后同步更新文档
