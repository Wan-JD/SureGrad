# 视觉验收记录 — 2026-05-23 ecust 招生/复试数据

验收人：自动化脚本 + 主线程审图（Playwright / Flutter Web）

## 结论

| 范围 | 结果 | 证据 |
|------|------|------|
| Mobile 专业详情（招生/复试字段） | **通过** | `docs/.visual-qa/mobile-program-detail.png` |
| Admin 既有页面回归 | **通过** | `docs/.visual-qa/admin-*.png` |
| Mobile 其他 Tab 回归 | **通过** | `docs/.visual-qa/mobile-*.png` |

专业详情页关键指标区已展示 2024 复试比 `1.22:1`；报录比仍为「待补充」（官方未披露报考人数）。招生信息区块通过 `program_admissions.csv` 入库后可展示计划 34 / 实际 39 等字段。

## 数据变更

- 新增 `program_admissions.csv`、`program_interview_stats.csv`（ecust 批次）
- `import_to_db.py` 支持上述模板入库
- 重新执行 `pnpm db:seed:ecust` 后 API `GET /programs/{id}` 返回 admissions/interviewStats

## 复现命令

```bash
pnpm db:seed:ecust
pnpm dev:api
pnpm dev:admin
pnpm verify:visual
```

## 工程校验

- `pnpm verify:api` — 通过
- `pnpm verify:admin` — 通过
- `pnpm verify:mobile` — 通过
