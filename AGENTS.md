# SureGrad — Agent / 自动化协作者入口

**读者**：Cursor、Codex 等 AI Agent，或任何「新开对话、无聊天记录」的自动化线程。  
**不是**给 GitHub 浏览者看的；人类读者请看 [`README.md`](README.md)。

---

## 1. 第一件事

1. 读 **[`docs/start-here.md`](docs/start-here.md)**（当前状态、并行推进线、验收规则、文档索引）。
2. 执行 `git status -sb` 与 `git log --oneline -5`，以 **仓库现状** 为准，勿依赖聊天历史。
3. 工作区路径：`C:\Users\hp\Documents\SureGrad`（脚本与文档链接均以此为准）。

---

## 2. 按模块补读（精简）

| 模块 | 先读 |
|------|------|
| 后端 | `docs/api-spec.md` → `docs/schema.sql` → `docs/backend-architecture.md` |
| 移动端 | `docs/prd.md` → `docs/ux-flow.md` → `docs/mobile-architecture.md` |
| 后台 | `docs/data-import-plan.md` → `apps/admin/README.md` |
| 数据采集 | `tools/data-import/README.md` → `tools/data-import/collected/*/README.md` |

完整分角色清单见 `docs/start-here.md` §3。

---

## 3. 硬性约定

### 3.1 Git 提交

- **禁止** `Co-authored-by: Cursor` 或任何 AI/agent 署名（详见 `.cursor/rules/git-commits.mdc`）。
- 作者使用仓库主人的 **GitHub 身份**（`154341837+Wan-JD@users.noreply.github.com`）。
- 优先 `git.exe commit -F <消息文件> --no-verify`（避免钩子注入 trailer）；提交后用 `git log -1 --format=%B` 复核。
- 用户未明确要求时 **不要** 擅自 commit；协作规则要求合格轮次 push 时除外。

### 3.2 验收

一轮 **合格** = 对应 `pnpm verify:*` 通过 +（有 UI 改动时）`pnpm verify:visual` 通过 + 在 `docs/visual-qa/` 写简短记录。

```bash
pnpm verify:api
pnpm verify:admin
pnpm verify:mobile
pnpm verify:visual   # 需 dev:api + dev:admin；见 tools/visual-qa/
```

不得用「服务已启动」或 HTML 抓取代替截图验收。

### 3.3 协作边界

- 优先完善骨架与联调；**非用户明确要求不扩大数据采集范围**。
- 实现可分子任务；主控负责分工、验收、文档同步与 push 时机。
- 关键结论写回 `docs/start-here.md` 等文档，不要只留在聊天里。

---

## 4. 常用命令速查

```bash
pnpm db:seed:demo          # 双校采集 + 资料 + 管理员
pnpm dev:api               # :3000/api/v1
pnpm dev:admin             # :3001
pnpm verify:all            # 工程 + 视觉（视觉耗 set）
```

---

## 5. 提示词模板

可复制到新对话开头：

```text
工作区：C:\Users\hp\Documents\SureGrad
先读 AGENTS.md 与 docs/start-here.md，再 git status / git log。
按 start-here 当前推进线执行；UI 改动须 verify:visual；commit 禁止 AI 署名。
```

更长的分场景提示词见 `docs/codex-session-prompts.md`（如有）。
