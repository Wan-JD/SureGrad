# 视觉验收记录 — 2026-05-23 Admin 年度数据接采集 CSV

验收人：自动化脚本 + 主线程审图（Playwright / Flutter Web）

## 结论

| 范围 | 结果 | 证据 |
|------|------|------|
| Admin 年份数据（招生计划/复试） | **通过** | `docs/.visual-qa/admin-yearly-data-desktop.png` |
| Admin 首页采集统计 | **通过** | `docs/.visual-qa/admin-home-desktop.png` |
| Mobile 专业详情（含 815 初试科目） | **通过** | `docs/.visual-qa/mobile-program-detail.png` |
| 其他 Admin / Mobile 回归 | **通过** | `docs/.visual-qa/admin-*.png`、`mobile-*.png` |

年份数据页「招生计划」「复试统计」页签已展示 ecust 批次 CSV 行；首页摘要新增招生计划/初试科目计数。专业详情视觉断言包含「815」。

## 复现命令

```bash
pnpm dev:api
pnpm dev:admin
pnpm verify:visual
```

## 工程校验

- `pnpm verify:admin` — 通过
