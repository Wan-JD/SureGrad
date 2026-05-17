# SureGrad 管理后台

`apps/admin` 是 SureGrad 的管理后台骨架工程，当前阶段只完成后台壳、导航结构和模块占位，不进入复杂业务实现。

## 本次目标

基于 `docs/prd.md` 和 `docs/database-design.md`，先把 MVP 后台需要的数据治理入口搭起来，覆盖以下 6 个模块：

1. 学校管理
2. 院系管理
3. 专业管理
4. 年份数据管理
5. 资料推荐管理
6. 来源链接管理

## 技术栈

- Next.js App Router
- React
- TypeScript
- ESLint

## 目录结构

```text
apps/admin
├─ public/
├─ src/
│  ├─ app/
│  │  ├─ departments/
│  │  ├─ programs/
│  │  ├─ resources/
│  │  ├─ schools/
│  │  ├─ source-links/
│  │  ├─ yearly-data/
│  │  ├─ favicon.ico
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  └─ page.tsx
│  ├─ components/
│  │  ├─ admin-shell.tsx
│  │  ├─ admin-sidebar.tsx
│  │  └─ module-placeholder.tsx
│  └─ config/
│     └─ admin-navigation.ts
├─ eslint.config.mjs
├─ next.config.mjs
├─ package.json
└─ tsconfig.json
```

## 页面说明

- `/`
  后台首页，用于展示骨架说明、模块入口和当前实现边界。
- `/schools`
  学校管理占位页。
- `/departments`
  院系管理占位页。
- `/programs`
  专业管理占位页。
- `/yearly-data`
  年份数据管理占位页，后续可拆分到分数线、报录比、复录比等子模块。
- `/resources`
  资料推荐管理占位页。
- `/source-links`
  来源链接管理占位页。

## 与文档的对应关系

- `schools -> departments -> programs`
  对应学校、院系、专业 3 个后台主模块。
- `program_admissions / program_score_lines / program_application_stats / program_interview_stats`
  统一归入“年份数据管理”入口，先保留聚合落点。
- `study_resources`
  对应“资料推荐管理”。
- `program_source_links`
  对应“来源链接管理”。

## 当前未实现

以下内容本次都没有进入：

- 登录与权限控制
- 接口联调
- 列表分页、搜索和筛选
- 表单录入、校验和提交
- 数据表格、详情抽屉、批量操作
- 上传、导入导出
- 业务状态流转

## 启动方式

在仓库根目录执行：

```bash
cd apps/admin
npm install
npm run dev
```

默认访问：

```text
http://localhost:3000
```

如果本机 3000 端口已被占用，可以改用：

```bash
npm run dev -- --port 3001
```

## 后续建议

推荐按以下顺序继续往下做：

1. 接入后台登录与基础权限壳
2. 为 6 个模块补充列表页与筛选区
3. 按数据库设计文档逐步接入表单和 API
4. 拆出年份数据子页面与来源追踪能力
