# SureGrad API

SureGrad 后端服务骨架，基于 NestJS，目录位于 `services/api`。

## 当前状态

- 已完成 NestJS 工程初始化
- 已完成按领域拆分的模块骨架
- 已接入环境变量管理与基础校验
- 已落下 PostgreSQL + TypeORM 的接入方案配置
- 已预留核心 REST 路由入口

当前阶段目标是“先把底座搭起来”，所以大部分业务接口仍返回骨架占位响应，方便后续逐模块补实现。

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
│     └─ resources
├─ test
└─ .env.example
```

## 已创建模块

- `auth`
- `users`
- `schools`
- `programs`
- `plans`
- `todos`
- `checkins`
- `resources`

## 环境变量

复制示例配置：

```powershell
Copy-Item .env.example .env
```

示例文件：

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

或只在服务目录执行：

```powershell
pnpm install
pnpm start:dev
```

默认启动地址：

- API: `http://localhost:3000/api/v1`
- Health Check: `http://localhost:3000/api/v1/health`

## 常用命令

```powershell
pnpm build:api
pnpm lint:api
pnpm test:api
pnpm test:api:e2e
```

如果当前目录在 `services/api`：

```powershell
pnpm build
pnpm lint
pnpm test
pnpm test:e2e
```

## 数据库接入方案

当前后端采用：

- 数据库：PostgreSQL
- 访问层：TypeORM
- 配置入口：`src/database/database.module.ts`
- 环境配置：`src/common/config/database.config.ts`
- DDL 基线：`docs/schema.sql`

当前为了先完成骨架并避免本地没有数据库时无法启动，TypeORM 配置为 `manualInitialization: true`。这意味着：

- 应用可以先启动起来
- 当前不会在启动时自动连库
- 后续进入实体/仓储实现阶段时，可以切换为自动初始化，或在启动流程里显式初始化 DataSource

建议后续演进方式：

1. 以 `docs/schema.sql` 作为当前表结构基线。
2. 补齐实体、仓储和 migrations 管理策略。
3. 打开真实数据库初始化与健康检查。

## 已预留的接口方向

已按 `docs/api-spec.md` 预留主要路由入口，例如：

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
- `GET /study-checkins/today`
- `POST /study-checkins`
- `GET /study-stats/overview`
- `GET /study-resources`

## 当前未完成边界

以下内容仍未实现，仅保留了结构和入口：

- JWT 鉴权与用户会话
- OTP 短信发送与校验
- 实体定义、Repository、Service 真实读写逻辑
- 收藏、对比、提醒等非本次必做模块
- 数据导入、迁移脚本与种子数据
- Swagger / OpenAPI 自动文档
- 统一异常模型、统一响应封装、中间件审计链路

## 参考文档

- [PRD](C:/Users/hp/Documents/SureGrad/docs/prd.md)
- [Database Design](C:/Users/hp/Documents/SureGrad/docs/database-design.md)
- [API Spec](C:/Users/hp/Documents/SureGrad/docs/api-spec.md)
- [Schema SQL](C:/Users/hp/Documents/SureGrad/docs/schema.sql)
- [Backend Architecture](C:/Users/hp/Documents/SureGrad/docs/backend-architecture.md)
