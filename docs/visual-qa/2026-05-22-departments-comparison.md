# 视觉验收记录 — 2026-05-22 院系/来源链接 + 专业对比

验收人：自动化脚本 + 主控审图

## 结论

| 范围 | 视口 | 结果 | 证据 |
|------|------|------|------|
| Admin 院系管理 | desktop / tablet / mobile | **通过** | `admin-departments-*.png` |
| Admin 来源链接 | desktop / tablet / mobile | **通过** | `admin-source-links-*.png` |
| Mobile 专业对比 | mobile + tablet | **通过** | `mobile-guest-comparison*.png` |
| 全量 `pnpm verify:visual` | — | **通过** | `docs/.visual-qa/` |

## 工程校验

| 命令 | 结果 |
|------|------|
| `pnpm verify:api` | **通过** |
| `pnpm verify:admin` | **通过** |
| `pnpm verify:mobile` | **通过** |
| `pnpm verify:visual` | **通过** |

## 本轮增量

1. `capture-admin.mjs` — `/departments`、`/source-links` 三视口。
2. `main_visual_qa_comparison.dart` + `run-mobile-visual.mjs` — 对比页 mobile/tablet 截图与文案断言。

## 主控备注

- Admin 院系/来源链接页窄屏表格堆叠与学校/专业页一致。
- Mobile 对比页 tablet 侧栏 Rail + 空池引导文案「比较池还是空的」布局正常。
