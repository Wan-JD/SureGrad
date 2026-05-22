# SureGrad API

SureGrad 后端服务位于 `services/api`，基于 NestJS，当前已经承接三端联调所需的核心业务入口。

## 当前状态

- 已完成 NestJS 工程初始化、模块拆分和环境配置接入
- 已接入 PostgreSQL + TypeORM 的配置方案与 schema 基线
- 已落地学校、专业、目标、计划、Todo、打卡、资料等核心 REST 路由
- 当前重点不再是“只搭骨架”，而是持续把剩余占位模块补成真实读写和可验收链路

当前这套 API 已经可以支撑以下主流程：

- 登录后读取用户快照与当前目标
- 围绕学校、专业与年份数据完成前台查询
- 生成并读取当前学习计划、周计划、日计划
- 创建 Todo、完成 Todo，并回读当日执行状态
- 执行每日打卡，并保持 overview 摘要一致
- 拉取学习资料列表

## 技术栈

- NestJS 11
- TypeScript 5
- `@nestjs/config`
- `@nestjs/typeorm`
- PostgreSQL
- TypeORM
- `class-validator` / `class-transformer`

## 目录结构

```text
services/api
├─ src
│  ├─ common
│  │  ├─ auth
│  │  ├─ config
│  │  ├─ dto
│  │  └─ utils
│  ├─ database
│  └─ modules
│     ├─ auth
│     ├─ users
│     ├─ schools
│     ├─ programs
│     ├─ plans
│     ├─ todos
│     ├─ checkins
│     ├─ resources
│     ├─ favorites
│     ├─ comparison-items
│     └─ reminders
├─ test
└─ .env.example
```

## 已建模块

- `auth`
- `users`
- `schools`
- `programs`
- `plans`
- `todos`
- `checkins`
- `resources`
- `favorites`
- `comparison-items`
- `reminders`

## 环境变量

复制示例配置：

```powershell
Copy-Item .env.example .env
```

示例内容：

```env
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1
CORS_ORIGIN=http://localhost:3001

DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_NAME=suregrad
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_SCHEMA=public
DATABASE_SSL=false
DATABASE_SYNCHRONIZE=false
DATABASE_LOGGING=false
```

## 启动方式

在仓库根目录执行：

```powershell
pnpm install
pnpm dev:api
```

或在 `services/api` 目录执行：

```powershell
pnpm install
pnpm start:dev
```

默认地址：

- API: `http://localhost:3000/api/v1`
- Health Check: `http://localhost:3000/api/v1/health`

## 常用命令

在仓库根目录：

```powershell
pnpm build:api
pnpm lint:api
pnpm test:api
pnpm test:api:e2e
```

在 `services/api` 目录：

```powershell
pnpm build
pnpm lint
pnpm test
pnpm test:e2e
```

## 数据库接入

当前后端采用：

- 数据库：PostgreSQL
- 访问层：TypeORM
- 配置入口：`src/database/database.module.ts`
- 环境配置：`src/common/config/database.config.ts`
- DDL 基线：`docs/schema.sql`

### 本地种子数据（ecust 批次）

1. 对本机 `suregrad` 库执行 `docs/schema.sql`（需包含 `program_source_links.source_confidence` 等列）。
2. 安装导入依赖：`pip install -r tools/data-import/requirements.txt`
3. 在仓库根目录写入 ecust 五表：

```powershell
pnpm db:seed:ecust
```

（已有旧库、缺列时等价于 `pnpm db:migrate` + `pnpm db:import:ecust`）

4. 验证：`curl "http://localhost:3000/api/v1/schools?q=%E5%8D%8E%E4%B8%9C"`

若来源链接导入被跳过，请重新应用完整 `docs/schema.sql` 后再跑一次导入。

## 核心接口覆盖

当前已经围绕 `docs/api-spec.md` 落下主要接口，重点包括：

- `POST /auth/otp/send`
- `POST /auth/login/otp`
- `GET /users/me`
- `PUT /user-profiles/me`
- `GET /schools`
- `GET /schools/:schoolId`
- `GET /programs/:programId`
- `PUT /user-targets/current`
- `POST /study-plans/generate`
- `GET /study-plans/current`
- `GET /weekly-plans`
- `GET /daily-plans`
- `GET /todo-items`
- `POST /todo-items`
- `PATCH /todo-items/:todoId/complete`
- `GET /study-checkins/today`
- `POST /study-checkins`
- `GET /study-stats/overview`
- `GET /study-resources`

其中，学校/专业查询、目标设置、计划读取、Todo 执行、打卡写入与资料读取已经进入可联调状态。

## 仍待补齐的边界

以下能力仍然是后续迭代重点，但不再适合描述为“全站骨架占位”：

- JWT 鉴权、真实短信 OTP 与正式会话策略
- 收藏、对比、提醒等模块的更完整业务闭环
- 更细的统一异常模型、响应封装与审计链路
- Swagger / OpenAPI 自动化文档
- 数据导入、迁移脚本与种子数据工具链
- 与真实数据库初始化策略配套的实体和 migration 收口

## 参考文档

- [PRD](C:/Users/hp/Documents/SureGrad/docs/prd.md)
- [Database Design](C:/Users/hp/Documents/SureGrad/docs/database-design.md)
- [API Spec](C:/Users/hp/Documents/SureGrad/docs/api-spec.md)
- [Schema SQL](C:/Users/hp/Documents/SureGrad/docs/schema.sql)
- [Backend Architecture](C:/Users/hp/Documents/SureGrad/docs/backend-architecture.md)
