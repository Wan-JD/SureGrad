# Mobile 主路径 E2E 验收清单

日期：`2026-05-22`

前置：

1. API：`pnpm dev:api`（`http://localhost:3000/api/v1`）
2. 数据库已执行 `docs/schema.sql` 且已 `pnpm db:import:ecust`
3. 模拟器 API 地址：`http://10.0.2.2:3000/api/v1`（真机改用局域网 IP + `--dart-define=SUREGRAD_API_BASE_URL=...`）

## 路径：登录 → 设目标 → 生成计划 → Todo → 打卡

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 登录页输入任意手机号 + OTP `123456` | 进入主 Tab |
| 2 | 择校 → 华东理工 → 计算机科学与技术 →「设为目标」 | Snackbar 成功，规划 Tab 显示目标 |
| 3 | 或：对比页 →「设为目标专业」 | 跳转规划页，目标已更新 |
| 4 | 规划页 → 生成学习计划 | 无 `PROFILE_INCOMPLETE` / `TARGET_REQUIRED`（需档案已补全） |
| 5 | 首页（有计划）→「查看今日 Todo」/「去打卡」 | 进入 Todo 页 |
| 6 | Todo 完成一项 + 打开打卡 Sheet 提交 | 打卡成功，统计字段有变化 |

## 静态检查

```bash
pnpm verify:mobile
```
