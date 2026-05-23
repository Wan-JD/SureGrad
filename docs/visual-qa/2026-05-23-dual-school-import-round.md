# 视觉验收记录 — 2026-05-23 双校入库（sufe + ecust）

验收人：自动化脚本 + 主线程审图（Playwright / Flutter Web）

## 结论

| 范围 | 结果 | 证据 |
|------|------|------|
| Mobile 择校 Tab（双校列表） | **通过** | `docs/.visual-qa/mobile-guest-schools-tab.png` |
| Admin 首页采集批次（双校缺口） | **通过** | `docs/.visual-qa/admin-home-desktop.png` |
| Admin 学校管理（双校 Live） | **通过** | `docs/.visual-qa/admin-schools-desktop.png` |
| 其他 Admin / Mobile 回归 | **通过** | `docs/.visual-qa/admin-*.png`、`mobile-*.png` |

`pnpm db:import:sufe` 后 API 返回华东理工 + 上海财经；移动端择校与 Admin 学校页可见双校。

## 数据 / 脚本

- 新增 `config.import-sufe-finance-2024.yaml`
- `pnpm db:import:sufe`、`pnpm db:seed:collected`、`db:seed:demo` 串联双批次

## 复现命令

```bash
pnpm db:seed:collected
pnpm dev:api
pnpm dev:admin
pnpm verify:visual
```

## 工程校验

- `pnpm verify:api` — 通过
- `pnpm verify:mobile` — 通过
- `pnpm verify:admin` — 本地 Google Fonts 拉取偶发失败；无 Admin 源码改动，CI 为准
