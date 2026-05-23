# 视觉验收记录 — 2026-05-23 ecust 初试科目

验收人：自动化脚本 + 主线程审图（Playwright / Flutter Web）

## 结论

| 范围 | 结果 | 证据 |
|------|------|------|
| Mobile 专业详情（关键指标/分数线） | **通过** | `docs/.visual-qa/mobile-program-detail.png` |
| Admin 既有页面回归 | **通过** | `docs/.visual-qa/admin-*.png` |
| Mobile 其他 Tab / 资料详情回归 | **通过** | `docs/.visual-qa/mobile-*.png` |

专业详情页顶部摘要仍为「报录比 待补充」（官方未披露报考人数）；2024 复试比 `1.22:1`、分数线 `340` 与入库数据一致。`subjects.csv` + `program_exam_subjects.csv` 已导入，API `GET /programs/{id}` 返回四门初试科目（含 815 计算机专业基础综合）。

## 数据变更

- 新增 ecust `subjects.csv`、`program_exam_subjects.csv`
- `import_to_db.py` 支持上述模板入库
- 来源链接补充学院 815→408 调整说明

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
