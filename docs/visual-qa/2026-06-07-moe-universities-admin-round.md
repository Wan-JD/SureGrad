# 2026-06-07 教育部高校名单扩容 Admin 视觉验收

## 背景

本轮将教育部 2025 全国普通高等学校名单整理为 `moe-universities-2025` 批次，`schools.csv` 共 2919 所普通高校基础条目，并接入 `pnpm db:seed:collected`。

## 验收命令

```powershell
$env:ADMIN_BASE_URL='http://localhost:3002'
node tools/visual-qa/capture-admin.mjs
```

## 结果

- 通过：Admin 三视口截图完整跑完。
- 截图目录：`docs/.visual-qa/`
- 重点确认：`/schools` 可加载 2919 所学校后的列表；基础名单学校显示教育部字段与缺口状态，华东理工等 5 校仍保留精采批次覆盖后的官网、研究生院链接和学校类型。

## 数据说明

教育部基础名单不包含分数线、招生计划、报录比、官网或研究生院链接；本轮没有用非官方来源补齐这些字段。
