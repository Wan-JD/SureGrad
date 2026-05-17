# SureGrad 移动端架构说明

日期：`2026-05-16`

关联文档：

- `docs/prd.md`
- `docs/ux-flow.md`
- `docs/api-spec.md`

## 1. 本轮目标

本轮仅初始化 `apps/mobile` 下的 Android-first Flutter 工程骨架，重点完成：

1. Android 平台工程初始化
2. 与产品文档一致的基础路由
3. 清晰的目录分层
4. 状态管理与 API 层预留
5. 关键页面骨架落地

## 2. 结构选择

本轮采用“应用层 + 核心层 + feature 层”的目录组织：

```text
apps/mobile/lib
├─ app
│  ├─ bootstrap
│  ├─ navigation
│  └─ theme
├─ core
│  ├─ network
│  ├─ state
│  └─ widgets
└─ features
   ├─ auth
   ├─ comparison
   ├─ favorites
   ├─ home
   ├─ planning
   ├─ profile
   ├─ reminders
   ├─ resources
   ├─ schools
   ├─ splash
   └─ todo
```

这样做的原因：

1. `app/` 承载应用启动、路由和主题，避免业务页面感知全局装配细节。
2. `core/` 放跨 feature 复用能力，例如 API client、会话状态和基础组件。
3. `features/` 按业务域拆开，便于后续并行开发和逐页联调。

## 3. 路由设计

当前路由以命名路由为主，优先满足 MVP 骨架清晰度：

- `/`：启动页
- `/login`：登录页
- `/home`：首页
- `/schools`：择校列表页
- `/schools/detail`：院校详情页
- `/planning`：规划页
- `/todo`：Todo 页
- `/resources`：资料页占位
- `/profile`：我的页
- `/favorites`：我的收藏
- `/comparison`：专业对比
- `/reminders`：提醒中心

其中：

1. `规划页`、`Todo 页` 按产品规则做了登录保护。
2. `收藏`、`对比`、`提醒中心` 也已经加上登录保护，便于后续联调受限操作。
3. 游客默认可以从启动页进入 `择校页`。
4. 登录页保留“登录成功后返回原页面”的基本跳转骨架。

## 4. 状态管理预留

当前没有引入额外第三方状态管理库，而是先用轻量方案预留状态边界：

1. `AppSessionStore` 负责登录态与基础会话信息。
2. `AppBootstrap` 统一装配仓库、API client 和全局状态。
3. `AppScope` 作为依赖注入入口，让页面能读取全局依赖。

这样可以先把工程边界稳定下来，后续如果团队要切到 Riverpod、Bloc 或 Provider，也只需要替换 `core/state` 与注入方式，不用重写 feature 目录。

## 5. API 层预留

API 层没有直接接 `services/api`，而是按文档独立预留客户端侧结构：

1. `core/network/api_client.dart`：统一请求入口占位
2. `core/network/api_result.dart`：统一请求结果模型
3. `features/*/data/*_api.dart`：资源级 API 映射
4. `features/*/data/*_repository.dart`：页面侧使用的仓库边界

当前仓库里的 API 类主要完成两件事：

1. 明确每个 feature 未来会用到哪些接口路径
2. 给 UI 骨架和后续联调留出稳定调用面

## 6. 页面状态

本轮重点页面分为两类：

1. 已有可交互骨架：
   - 启动页
   - 登录页
   - 首页
   - 择校列表页
   - 院校详情页
   - 规划页
   - Todo 页
   - 我的页
   - 我的收藏页
   - 专业对比页
   - 提醒中心页
2. 额外补充的导航占位页：
   - 资料页

这里的“可交互”仅指路由跳转、登录模拟和页面框架，不代表真实业务数据已接入。

## 7. 后续建议

建议后续按下面顺序继续补：

1. 接入真实 Android SDK / 模拟器，跑通 `flutter run`
2. 先接登录、择校列表、院校详情三个接口
3. 再补目标设置、学习路线、Todo 数据模型
4. 最后统一完善空态、错误态、加载态
