# SureGrad（中文名：一研为定）

SureGrad 是一款以 Android 为优先平台的考研备考 App，核心聚焦以下方向：

- 院校与专业信息分析
- 分数线、报录比、复录比等择校数据
- 学习规划、Todo、打卡与执行闭环
- 合法公开的学习资料推荐

## 项目目标

本项目希望解决考研用户在备考过程中的两类关键问题：

1. 择校信息分散，难以高效对比和决策
2. 学习规划与日常执行容易断裂，缺少持续推进工具

MVP 当前聚焦的核心闭环为：

`查院校 -> 收藏对比 -> 设定目标 -> 生成学习计划 -> 执行 Todo -> 打卡复盘`

## 仓库结构

```text
docs/               产品、需求、流程与数据库设计文档
apps/mobile/        Flutter 移动端应用
apps/admin/         管理后台
services/api/       后端 API 服务
packages/shared/    共享常量、类型或工具
tools/data-import/  数据导入与处理脚本
```

## 当前文档基线

当前仓库已经完成以下基础文档：

- `docs/project-plan.md`：项目计划书
- `docs/prd.md`：MVP 产品需求文档
- `docs/database-design.md`：数据库设计文档
- `docs/schema.sql`：PostgreSQL 建表 SQL
- `docs/api-spec.md`：MVP 接口设计文档
- `docs/ux-flow.md`：页面流程与信息架构文档

## 协作建议

建议在 Codex 中采用“主控窗口 + 多线程分工”的方式推进：

1. 主控窗口负责审阅、统一口径、提交与推送
2. 产品线程负责 PRD、流程和路线图文档
3. 数据线程负责建模、DDL 和导入方案
4. 后端线程负责 API 与服务骨架
5. 移动端线程负责 Flutter 工程与页面主流程
6. 后台线程负责管理后台与运营能力

## 后续推荐顺序

1. 完善数据导入方案
2. 初始化 `services/api` 后端骨架
3. 初始化 `apps/mobile` 移动端骨架
4. 初始化 `apps/admin` 管理后台骨架
5. 进入 MVP 第一批功能开发与联调
