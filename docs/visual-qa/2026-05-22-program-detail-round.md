# 视觉验收记录 — 2026-05-22 专业详情页

验收人：自动化脚本 + 主线程审图（Playwright / Flutter Web）

## 结论

| 范围 | 结果 | 证据 |
|------|------|------|
| Mobile 专业详情（ecust 计算机） | **通过** | `docs/.visual-qa/mobile-program-detail.png` |
| Admin 用户/首页/年份等基线 | **通过** | `docs/.visual-qa/admin-*.png` |
| Mobile 游客择校/启动/规划等基线 | **通过** | `docs/.visual-qa/mobile-*.png` |

专业详情页通过 `GET /programs/{id}` 展示华东理工计算机科学与技术：2024 分数线 340、初试科目拆分、来源链接区块；报录比/复试比/招生等空态文案为「待补充」或「暂无…数据」，与当前 ecust 批次 CSV 范围一致。

## 复现命令

```bash
pnpm dev:api
pnpm dev:admin
pnpm verify:visual
```

## 工程校验

- `pnpm verify:api` — 通过
- `pnpm verify:admin` — 通过
- `pnpm verify:mobile` — 通过（含 `program_detail_page_test`）
