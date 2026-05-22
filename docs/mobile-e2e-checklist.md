# Mobile 主路径 E2E 验收清单

日期：`2026-05-23`

前置：

1. API：`pnpm dev:api`（`http://localhost:3000/api/v1`）
2. 数据库已执行 `docs/schema.sql` 且已 `pnpm db:import:ecust`
3. 模拟器 API 地址：`http://10.0.2.2:3000/api/v1`（真机改用局域网 IP + `--dart-define=SUREGRAD_API_BASE_URL=...`）

## 路径：游客冷启动 → 择校（无需先登录）

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 未登录状态冷启动 App（或从「我的」退出后杀进程重开） | 直接进入底部 **择校** Tab（标题「择校」），不是登录页 |
| 2 | 浏览院校列表、点进一所院校详情 | 可正常查看，无登录拦截 |
| 3 | 点收藏 / 加入对比 / 设为目标 | 跳转登录页；页头说明登录后回到当前动作 |
| 4 | 登录（任意手机号 + OTP `123456`） | 回到步骤 3 触发的页面（如院校详情或择校列表），而非被固定扔回首页 |
| 5 | 个人中心 → 返回启动页（若有入口） | 启动页主按钮为 **先逛院校**，次按钮为 **手机号登录**；点登录时 `redirectTo` 为择校 |

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

## 视觉 / 自动化验收记录（2026-05-23）

| 项 | 方式 | 结论 |
|----|------|------|
| 游客冷启动进择校 Tab | `flutter test test/widget_test.dart`（`guest cold start lands on schools tab`） | 通过：底部导航 + AppBar 各 1 处「择校」，无「先逛院校」 |
| 启动页双按钮 | 同上（`splash offers browse schools before login`） | 通过：「先逛院校」「手机号登录」 |
| Admin 首页采集缺口 | `pnpm dev:admin` + 页面 HTML 含 `batch-gap`、`上海财经`、`sufe-finance` | 通过 |
| Admin 年份数据缺口横幅 | `/yearly-data` 同上 | 通过 |

真机 / 模拟器截图（`flutter run` + Pixel 6）建议在 API 已启动且 `db:seed:ecust` 后补一轮，用于确认列表非空态与网络错误提示。
