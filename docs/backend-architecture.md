# SureGrad 后端架构说明

版本：`v0.1`  
日期：`2026-05-16`

## 1. 文档目标

本文档用于说明 SureGrad MVP 后端在当前阶段采用的工程组织方式、数据库接入方案和后续实现边界，作为 `services/api` 工程骨架的配套技术说明。

## 2. 当前技术决策

### 2.1 框架

- 服务框架：NestJS
- 语言：TypeScript
- 运行时：Node.js 20
- 包管理：pnpm workspace

### 2.2 配置管理

- 使用 `@nestjs/config`
- 在 `src/common/config` 中集中管理 `app` 与 `database` 配置
- 启动时执行基础环境变量校验

### 2.3 数据库方案

- 数据库：PostgreSQL
- ORM / 接入层：TypeORM
- 当前表结构基线：`docs/schema.sql`

当前阶段采用“SQL 先行、应用骨架跟进”的方式：

1. `docs/schema.sql` 继续作为结构设计事实来源。
2. `services/api` 先完成配置、模块边界、路由入口和 DTO。
3. 后续再分阶段补实体映射、仓储层、真实事务与 migrations。

## 3. 工程结构

```text
services/api/src
├─ common
│  ├─ config
│  ├─ dto
│  └─ utils
├─ database
└─ modules
   ├─ auth
   ├─ users
   ├─ schools
   ├─ programs
   ├─ favorites
   ├─ comparison-items
   ├─ plans
   ├─ todos
   ├─ checkins
   ├─ resources
   └─ reminders
```

### 3.1 `common`

负责放置跨模块通用能力：

- 环境配置
- 通用分页 DTO
- 通用占位响应构造工具

### 3.2 `database`

负责收敛数据库接入配置：

- PostgreSQL 连接参数
- TypeORM 基础选项
- 后续实体自动装配入口

### 3.3 `modules`

按业务领域拆分，避免把控制器和服务全部堆到一个模块里，便于后续并行开发：

- `auth`：验证码登录、后续 JWT / refresh token
- `users`：用户基础资料、档案信息
- `schools`：院校搜索与详情
- `programs`：专业详情与历年数据聚合
- `favorites`：收藏列表与收藏写操作
- `comparison-items`：专业对比池与对比结果
- `plans`：目标设置、学习计划、周计划、日计划
- `todos`：任务管理
- `checkins`：打卡与学习统计
- `resources`：学习资料推荐
- `reminders`：提醒中心与用户自定义提醒

## 4. 路由组织原则

当前按 `docs/api-spec.md` 的资源命名组织路由，尽量保持未来真实接口与现有文档一致，避免后续大规模改路径。

例如：

- `/auth/*`
- `/users/*`
- `/user-profiles/*`
- `/schools/*`
- `/programs/*`
- `/favorites/*`
- `/comparison-items/*`
- `/user-targets/*`
- `/study-plans/*`
- `/weekly-plans/*`
- `/daily-plans/*`
- `/todo-items/*`
- `/study-checkins/*`
- `/study-stats/*`
- `/study-resources/*`
- `/reminders/*`

全局前缀为：

```text
/api/v1
```

## 5. 数据库接入说明

当前 `DatabaseModule` 已经完成 TypeORM 配置封装，但为了确保“没有数据库环境时也能先启动工程”，暂时启用了：

```text
manualInitialization: true
```

这代表：

- 连接参数已经就位
- 数据库接入方案已经选定
- 但应用启动时不会立即主动建立真实连接

这样做的原因是本次任务重点是“搭骨架”，而不是一次性完成所有实体与仓储实现。

后续进入真实开发时，可按下面顺序推进：

1. 为各表补实体类。
2. 在领域模块中引入 `TypeOrmModule.forFeature(...)`。
3. 增加 repositories / query services。
4. 切换为自动初始化，或在 bootstrap 中手动初始化 DataSource。
5. 增加数据库健康检查。

## 6. 当前实现边界

本轮明确没有完成的内容：

- 鉴权守卫
- JWT 签发与刷新
- OTP 外部服务集成
- 实体类与仓储实现
- 统一异常过滤器和统一响应格式
- Swagger 自动文档
- 数据导入和后台运营接口

补充说明：

1. `favorites`、`comparison-items`、`reminders` 已补到路由骨架层，当前仍是占位响应，还没有真实持久化。
2. `weekly-plans`、`daily-plans`、`user-targets`、`todo-items` 已补齐 API 文档中定义的更新或查询接口。

## 7. 后续推荐拆分顺序

建议后续按以下顺序推进：

1. `auth`：先打通登录与用户识别。
2. `users` + `plans`：完成档案、目标、计划骨架。
3. `schools` + `programs`：完成查询型接口。
4. `todos` + `checkins`：完成执行闭环。
5. `resources`：完成资料推荐。
6. `favorites` / `comparison-items` / `reminders`：补齐 P1 能力。

## 8. 结论

当前后端已经具备以下条件：

- 可安装、可启动、可构建、可测试
- 模块边界已经清晰
- API 命名与文档方向已经对齐
- 数据库接入方案已经固定为 PostgreSQL + TypeORM

后续可以直接在现有骨架上逐模块补实体、仓储、业务规则和真实接口实现。
