# 视觉验收记录 — 2026-05-22 CORS 与 Mobile harness

## 结论

| 范围 | 结果 | 证据 |
|------|------|------|
| Mobile 全 harness | **通过** | `mobile-guest-*`、`mobile-splash-guest`（含 tablet） |
| Mobile 首页 tablet | **通过** | `mobile-guest-home-tab-tablet.png`（NavigationRail + 游客主链路） |
| API 开发 CORS | **通过** | development 下放行 `127.0.0.1:*` 视觉端口 |

## 工程校验

- `pnpm verify:api` / `verify:mobile` — 通过
- `node tools/visual-qa/run-mobile-visual.mjs` — 通过

## 增量

1. `resolveCorsOrigin` — 开发环境扩展 CORS
2. `main_visual_qa_home.dart` + 首页 tablet 截图
3. Web `ensureSemantics()` — Playwright 可读 Flutter 文案
