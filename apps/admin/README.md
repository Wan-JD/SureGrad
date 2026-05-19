# SureGrad 管理后台

`apps/admin` 是 SureGrad 的运营后台工程，目标是给运营同学提供学校、院系、专业、年份数据、资料推荐、来源链接这 6 条主数据治理入口。

在继续修改后台之前，先读：

1. `docs/start-here.md`
2. `docs/database-design.md`
3. `docs/schema.sql`
4. `docs/data-import-plan.md`

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
│  ├─ config/
│  └─ lib/
├─ .env.example
├─ eslint.config.mjs
├─ next.config.mjs
├─ package.json
└─ tsconfig.json
```

## 当前联调状态

- `/`
  首页已经会直接读取 `tools/data-import/collected`，展示真实采集批次数、学校数、专业数、来源链接数、分数线记录数和覆盖年份。
- `/schools`
  学校管理页已按真实 API 工作台思路搭建，默认请求 `NEXT_PUBLIC_ADMIN_API_BASE_URL`。
- `/departments`
  院系管理页当前仍以工作台骨架与运营视角文案为主。
- `/programs`
  专业管理页已按真实 API 工作台思路搭建，默认请求 `NEXT_PUBLIC_ADMIN_API_BASE_URL`。
- `/yearly-data`
  年份数据页会优先展示 `tools/data-import/collected` 里已采集的真实年度表；当前真实接入最明确的是分数线页签。
- `/resources`
  资料推荐页仍以运营结构、列表与详情布局为主，后续继续接真实数据。
- `/source-links`
  来源链接页会优先展示已采集真实批次里的来源链接，便于运营核对批次覆盖、年份和复核时间。

补充说明：

1. 后台文案已经在向运营表达收口，后续不要把原始 `id`、表名、工程枚举重新当成主信息展示。
2. 如果本地 API 没有把 `/api/v1/schools` 等接口跑通，学校页和专业页可能展示空态或错误态，这属于联调缺口，不代表后台结构未完成。

## 与文档的对应关系

- `schools -> departments -> programs`
  对应学校、院系、专业 3 个后台主模块。
- `program_admissions / program_score_lines / program_application_stats / program_interview_stats`
  统一归入“年份数据管理”入口。
- `study_resources`
  对应“资料推荐管理”。
- `program_source_links`
  对应“来源链接管理”。

## 当前未实现

以下内容仍待继续补齐：

- 登录与权限控制
- 院系、年份数据、来源链接等管理 API 联调
- 列表分页、搜索和筛选
- 表单录入、校验和提交
- 数据表格、详情区、批量操作
- 上传、导入导出
- 业务状态流转

## 启动方式

推荐先启动 API，再启动后台。

在仓库根目录执行：

```bash
pnpm install
pnpm dev:api
```

再新开一个终端执行：

```bash
cd apps/admin
pnpm dev
```

默认访问：

```text
http://localhost:3001
```

默认 API 地址：

```text
http://localhost:3000/api/v1
```

如需改后台指向的 API，可复制 `.env.example` 为 `.env.local` 后覆盖 `NEXT_PUBLIC_ADMIN_API_BASE_URL`。

如果本机 3001 端口已被占用，可以改用：

```bash
pnpm dev -- --port 3002
```

## 后续建议

推荐按以下顺序继续往下做：

1. 继续打通 `schools`、`programs` 的真实接口，减少学校页和专业页对空态的依赖。
2. 为 6 个模块补充更完整的列表筛选、表单录入和导入修订流程。
3. 让年份数据页不只展示“当前有什么”，也能清楚暴露“还缺什么模板、什么年份、什么字段”。
4. 后续所有后台迭代都保持运营视角，避免退回开发者控制台式表达。
