# 视觉验收记录 — 2026-05-22 Admin 院系 Live API

验收人：自动化脚本 + 主线程审图（Playwright）

## 结论

| 范围 | 结果 | 证据 |
|------|------|------|
| Admin `/departments` Live 列表 | **通过** | `docs/.visual-qa/admin-departments-desktop.png` |
| 院系行展示学校名 | **通过** | 列表含「华东理工大学 / 信息科学与工程学院」 |

`/departments` 已从 CSV 静态工作台切换为 `GET /admin/departments` 只读 Live 工作台，支持按学校、状态与关键词筛选。

## 复现命令

```bash
pnpm dev:api
pnpm dev:admin
node tools/visual-qa/capture-admin.mjs
```

## 工程校验

- `pnpm verify:api` — 通过（含 `AdminDepartmentsService` 单测）
- `pnpm verify:admin` — 通过
