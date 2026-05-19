# SureGrad

中文品牌名可用于产品展示：`一研为定`

SureGrad 是一个 Android-first 的考研备考产品，当前 MVP 核心闭环是：

`查院校 -> 收藏对比 -> 设定目标 -> 生成学习计划 -> 执行 Todo -> 打卡复盘`

## 先读这里

如果你是新开的对话、刚接手的主控线程，或者准备分发子任务，先读：

1. `docs/start-here.md`
2. `docs/project-plan.md`
3. `docs/prd.md`

`docs/start-here.md` 已经整理了当前仓库的阅读顺序、真实数据采集状态、后台现状和下一步建议，优先级高于聊天记录。

## 工作区规则

所有本地路径、脚本说明、文档链接和提示词统一使用：

`C:\Users\hp\Documents\SureGrad`

## 仓库结构

```text
docs/               产品、需求、流程、架构与接班入口
apps/mobile/        Flutter Android-first 移动端
apps/admin/         Next.js 管理后台
services/api/       NestJS 后端 API
packages/shared/    共享类型与工具
tools/data-import/  数据采集、校验、规范化与 dry-run 工具链
```

## 当前状态概览

### 文档

以下基线文档已在仓库内维护：

1. `docs/project-plan.md`
2. `docs/prd.md`
3. `docs/ux-flow.md`
4. `docs/database-design.md`
5. `docs/schema.sql`
6. `docs/api-spec.md`
7. `docs/backend-architecture.md`
8. `docs/mobile-architecture.md`
9. `docs/data-import-plan.md`
10. `docs/codex-session-prompts.md`
11. `docs/start-here.md`

### 后端

`services/api` 已经不只是纯骨架，正沿着 `docs/api-spec.md` 继续把部分接口从 skeleton 推进到真实实现。

### 移动端

`apps/mobile` 已经具备主流程级页面和状态串联，当前阶段重点是继续提高真实联调占比与视觉验收质量。

### 后台

`apps/admin` 已经从偏开发者式样板收口到运营工作台表达，并且首页、来源链接页、年份数据页已经能看见仓库里的部分真实采集批次。

### 数据采集

`tools/data-import` 已有可验收的校验、规范化、批次报告和 dry-run 工具链，同时已经落地第一批真实采集样例：

`tools/data-import/collected/ecust-cs-2024`

## 快速启动

在仓库根目录执行：

```bash
pnpm install
pnpm dev:api
```

启动后台：

```bash
cd apps/admin
pnpm dev
```

后台默认访问地址：

```text
http://localhost:3001
```

后台默认 API 地址：

```text
http://localhost:3000/api/v1
```

启动移动端：

```bash
cd apps/mobile
flutter pub get
flutter run
```

## 模块文档入口

### 主控 / 接班

1. `docs/start-here.md`
2. `docs/codex-session-prompts.md`

### 后端

1. `docs/api-spec.md`
2. `docs/database-design.md`
3. `docs/schema.sql`
4. `docs/backend-architecture.md`

### 移动端

1. `docs/prd.md`
2. `docs/ux-flow.md`
3. `docs/api-spec.md`
4. `docs/mobile-architecture.md`

### 后台

1. `docs/database-design.md`
2. `docs/schema.sql`
3. `docs/data-import-plan.md`
4. `apps/admin/README.md`

### 数据采集

1. `docs/data-import-plan.md`
2. `docs/database-design.md`
3. `docs/schema.sql`
4. `tools/data-import/README.md`

## 协作约定

1. 新对话先读文档，再看 `git status`，不要只依赖聊天记录。
2. 主控线程优先负责审阅、验收、统一口径、文档同步和推送时机。
3. 详细实现尽量分发给子线程，主控不要把所有细节工作都自己做完。
4. 涉及后台或移动端页面的改动，验收时必须补视觉检查。
5. 每一轮迭代结束后，把“当前状态、已知缺口、下一步建议”写回仓库文档。
