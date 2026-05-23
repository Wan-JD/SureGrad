# 视觉验收记录 — 2026-05-23 Admin 登录落点首页

验收人：自动化脚本 + 主线程审图（Playwright）

## 结论

| 范围 | 结果 | 证据 |
|------|------|------|
| Admin 登录后首页 | **通过** | `docs/.visual-qa/admin-home-desktop.png` |
| 其他 Admin 页面回归 | **通过** | `docs/.visual-qa/admin-*.png` |

登录成功后进入 `/` 运营工作台，可见「真实采集批次概览」与待补 CSV 清单；不再强制跳转 `/users`。

## 复现命令

```bash
pnpm dev:admin
node tools/visual-qa/capture-admin.mjs
```

## 工程校验

- `pnpm verify:admin` — 待 GitHub CI（本地字体拉取偶发失败）
