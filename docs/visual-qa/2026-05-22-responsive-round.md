# 视觉验收记录 — 2026-05-22 响应式多视口

验收人：自动化脚本 + 主控审图（Playwright / Flutter Web）

## 结论

| 范围 | 视口 | 结果 | 证据 |
|------|------|------|------|
| Admin 首页 | desktop 1440×900 | **通过** | `docs/.visual-qa/admin-home-desktop.png` |
| Admin 首页 | tablet 834×1194 | **通过** | `docs/.visual-qa/admin-home-tablet.png` |
| Admin 首页 | mobile 390×844 | **通过** | `docs/.visual-qa/admin-home-mobile.png` |
| Admin 年度数据 | desktop | **通过** | `docs/.visual-qa/admin-yearly-data-desktop.png` |
| Admin 年度数据 | tablet | **通过** | `docs/.visual-qa/admin-yearly-data-tablet.png` |
| Admin 年度数据 | mobile | **通过** | `docs/.visual-qa/admin-yearly-data-mobile.png` |
| Admin 资料推荐 Live | desktop | **通过** | `docs/.visual-qa/admin-resources-desktop.png` |
| Admin 资料推荐 Live | tablet | **通过** | `docs/.visual-qa/admin-resources-tablet.png` |
| Admin 资料推荐 Live | mobile | **通过** | `docs/.visual-qa/admin-resources-mobile.png` |
| Mobile 游客启动页 | mobile 390×844 | **通过** | `docs/.visual-qa/mobile-splash-guest.png` |
| Mobile 游客择校 Tab | mobile | **通过** | `docs/.visual-qa/mobile-guest-schools-tab.png` |
| Mobile 游客规划 Tab | mobile | **通过** | `docs/.visual-qa/mobile-guest-planning-tab.png` |
| Mobile 游客规划 Tab | tablet 834×1194 | **通过** | `docs/.visual-qa/mobile-guest-planning-tab-tablet.png` |
| Mobile 游客资料 Tab | mobile | **通过** | `docs/.visual-qa/mobile-guest-resources-tab.png` |
| Mobile 游客资料 Tab | tablet | **通过** | `docs/.visual-qa/mobile-guest-resources-tab-tablet.png` |

## 复现命令

```bash
pnpm dev:api
pnpm dev:admin
pnpm verify:visual
```

## 工程校验

| 命令 | 结果 |
|------|------|
| `pnpm verify:api` | **通过** |
| `pnpm verify:admin` | **通过** |
| `pnpm verify:mobile` | **通过** |
| `pnpm verify:visual` | **通过** |

## 本轮增量

1. **Admin** — `≤1080px` 抽屉侧栏 + 汉堡菜单；`≤720px` 表格 `record-table--stacked` 卡片化；工作区栅格单列折叠。
2. **Mobile** — `responsive_breakpoints.dart`（compact / medium / expanded）；`≥600px` 使用 `NavigationRail` + `ResponsivePageBody` 限宽；规划/资料/择校页统一 `contentPadding`。
3. **视觉脚本** — `capture-admin.mjs` 三视口；`run-mobile-visual.mjs` 规划/资料增补 tablet；resources 在窄屏回退 `.record-list-panel`。

## 主控备注

- Admin 手机端顶栏隐藏副文案，模块栅格与筛选工具栏纵向堆叠，资料表在 720px 以下以带 `data-label` 的堆叠行展示，无横向滚动条困扰。
- Mobile tablet 视口侧栏 Rail + 居中内容区宽度合理；规划/资料 harness 展示 API 不可用重试卡，布局与文案符合设计，非截图失败。
- 下一轮可补：择校 Tab tablet 截图、programs/schools Admin 页多视口、Mobile 宽屏双列学校卡片。
