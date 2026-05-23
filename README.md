# SureGrad

中文品牌名：**一研为定**

面向考研学子的备考产品（Android 优先）。MVP 主闭环：

**查院校 → 收藏对比 → 设定目标 → 学习计划 → Todo → 打卡复盘**

本仓库是 SureGrad 的 **monorepo**：移动端、管理后台、后端 API、数据采集工具链与产品文档都在同一项目中维护。

> 如果你是 **AI Agent / 自动化协作者**，请不要把本文件当作接班入口，请改读 [`AGENTS.md`](AGENTS.md) 与 [`docs/start-here.md`](docs/start-here.md)。

---

## 技术栈

| 模块 | 路径 | 技术 |
|------|------|------|
| 移动端 | `apps/mobile` | Flutter（Android-first，含 Web 用于部分验收） |
| 管理后台 | `apps/admin` | Next.js 15 |
| 后端 API | `services/api` | NestJS + PostgreSQL |
| 数据采集 | `tools/data-import` | Python（CSV 校验、规范化、入库） |
| 文档 | `docs/` | 产品、接口、库表、流程说明 |

包管理：**pnpm**（Node 侧）；移动端另需 **Flutter** 与 **Dart**。

---

## 环境要求

- Node.js 20+
- pnpm 9+
- PostgreSQL（本地默认：`127.0.0.1:5432`，库名 `suregrad`，用户/密码见 `tools/data-import` 配置）
- Flutter 3.x（仅开发移动端时需要）
- Python 3.10+（跑数据导入脚本时需要）

---

## 快速开始

### 1. 安装依赖

```bash
pnpm install
cd apps/mobile && flutter pub get && cd ../..
```

### 2. 初始化数据库（首次）

```bash
# 建表（全新库）
python tools/data-import/apply_schema.py

# 或：迁移 + 导入演示数据（华东理工 + 上财骨架 + 资料 + 管理员）
pnpm db:seed:demo
```

### 3. 启动服务

**API**（默认 `http://localhost:3000/api/v1`）：

```bash
pnpm dev:api
```

**管理后台**（默认 `http://localhost:3001`）：

```bash
pnpm dev:admin
```

演示管理员（由 `db:seed:admin` 写入）：用户名 `superadmin` / 密码 `super123`。

**移动端**（需模拟器或真机）：

```bash
cd apps/mobile
flutter run
```

Android 模拟器访问本机 API 时使用 `10.0.2.2:3000`；Web / 桌面调试使用 `localhost:3000`（见 `apps/mobile` 内 API 配置）。

---

## 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm verify` | API + Admin + Mobile 工程校验 |
| `pnpm verify:api` | 后端 build / lint / test |
| `pnpm verify:admin` | 后台 build / lint |
| `pnpm verify:mobile` | `flutter analyze` + `flutter test` |
| `pnpm verify:visual` | Admin Playwright + Mobile Web 截图验收 |
| `pnpm db:seed:collected` | 导入 `ecust-cs-2024` + `sufe-finance-2024` 采集批次 |
| `pnpm db:seed:demo` | 采集批次 + 备考资料 + 管理员账号 |

CI：推送到 `main` 或开 PR 时，GitHub Actions 会跑与 `pnpm verify` 等价的校验（见 `.github/workflows/ci.yml`）。

---

## 仓库结构

```text
apps/mobile/          Flutter 客户端
apps/admin/           Next.js 运营后台
services/api/         NestJS API
tools/data-import/    CSV 采集、校验、入库
docs/                 产品与技术文档
packages/shared/      共享类型（如有）
```

---

## 文档索引

按 **人类读者** 常用顺序：

| 文档 | 内容 |
|------|------|
| [`docs/project-plan.md`](docs/project-plan.md) | 项目背景与阶段目标 |
| [`docs/prd.md`](docs/prd.md) | 产品需求 |
| [`docs/ux-flow.md`](docs/ux-flow.md) | 移动端关键流程 |
| [`docs/api-spec.md`](docs/api-spec.md) | HTTP API 约定 |
| [`docs/database-design.md`](docs/database-design.md) | 领域与表说明 |
| [`docs/schema.sql`](docs/schema.sql) | PostgreSQL DDL（事实来源） |
| [`docs/data-import-plan.md`](docs/data-import-plan.md) | 数据采集与导入方案 |
| [`tools/data-import/README.md`](tools/data-import/README.md) | 导入工具使用说明 |
| [`apps/admin/README.md`](apps/admin/README.md) | 后台模块说明 |

---

## 演示数据说明

当前仓库内 **真实采集批次**（非虚构 mock）位于 `tools/data-import/collected/`：

| 批次 | 学校 | 说明 |
|------|------|------|
| `ecust-cs-2024` | 华东理工大学 | 计算机科学与技术，含分数线、招生、复试、初试科目等 |
| `sufe-finance-2024` | 上海财经大学 | 金融学骨架批次，部分字段仍为占位，待官方复核 |

各批次目录下有 `README.md` 记录来源与口径。导入后可用 `GET /api/v1/schools` 等接口在移动端/后台验证。

---

## 参与开发

1. 改 API / 后台 / 移动端后，在本地跑对应的 `pnpm verify:*`。
2. 涉及 **页面 UI** 的改动，维护者会跑 `pnpm verify:visual` 并留存 `docs/visual-qa/` 记录。
3. 提交信息可用中文；**不要**在 commit 中加入 AI / Cursor 署名（见仓库 `.cursor/rules/git-commits.mdc`）。
4. 产品或接口口径变更时，同步更新 `docs/` 中相关文档。

---

## 许可证

尚未单独声明开源许可证；使用前请联系仓库维护者。
