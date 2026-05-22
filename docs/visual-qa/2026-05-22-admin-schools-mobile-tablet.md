# 视觉验收记录 — 2026-05-22 Admin 学校/专业 + Mobile tablet 扩展

验收人：自动化脚本 + 主控审图

## 结论

| 范围 | 视口 | 结果 | 证据 |
|------|------|------|------|
| Admin 学校管理 | desktop / tablet / mobile | **通过** | `admin-schools-*.png` |
| Admin 专业管理 | desktop / tablet / mobile | **通过** | `admin-programs-*.png` |
| Mobile 择校 Tab | tablet 834×1194 | **通过** | `mobile-guest-schools-tab-tablet.png` |
| Mobile 首页 Tab | mobile + tablet | **通过** | `mobile-guest-home-tab*.png` |
| 既有 Admin / Mobile 截图 | 全视口 | **通过** | `pnpm verify:visual` |

## 工程校验

| 命令 | 结果 |
|------|------|
| `pnpm verify:api` | **通过**（本轮复用 Round 1） |
| `pnpm verify:admin` | **通过**（本轮复用 Round 1） |
| `pnpm verify:mobile` | **通过**（本轮复用 Round 1） |
| `capture-admin.mjs` | **通过** |
| `run-mobile-visual.mjs` | **通过** |

## 本轮增量

1. `capture-admin.mjs` — 新增 `/schools`、`/programs` 三视口；窄屏回退 `.record-list-panel`。
2. `run-mobile-visual.mjs` — 择校/首页/规划/资料 tablet 截图；`mustSeeAny` 文案断言；用 `flt-semantics` 等待替代 canvas 白屏采样（消除 Flutter Web 误报）。

## 主控备注

- Admin 学校/专业页在 720px 以下表格堆叠与 resources 一致；手机端筛选区纵向铺满。
- Mobile tablet 择校页 NavigationRail + 双列学校卡片（`ResponsiveColumns`）布局正常。
