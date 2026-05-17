# SureGrad Mobile

SureGrad 的 Android-first Flutter 客户端骨架，位于 `apps/mobile`。

## 本轮完成范围

1. 初始化 Flutter Android 工程
2. 建立按应用层 / 核心层 / feature 层拆分的目录结构
3. 配置基础命名路由
4. 预留状态管理与 API 层结构
5. 搭建以下页面骨架：
   - 启动页
   - 登录页
   - 首页
   - 择校列表页
   - 院校详情页
   - 规划页
   - Todo 页
   - 我的页
6. 额外补充资料页占位，用于对齐底部导航信息架构

## 目录结构

```text
apps/mobile
├─ android/                  # Android 平台工程
├─ lib/
│  ├─ app/
│  │  ├─ bootstrap/         # 应用依赖装配与注入入口
│  │  ├─ navigation/        # 路由、Tab、路由参数
│  │  └─ theme/             # 主题配置
│  ├─ core/
│  │  ├─ network/           # API client / config / result 预留
│  │  ├─ state/             # 全局状态预留
│  │  └─ widgets/           # 基础通用组件
│  └─ features/
│     ├─ auth/
│     ├─ home/
│     ├─ planning/
│     ├─ profile/
│     ├─ resources/
│     ├─ schools/
│     ├─ splash/
│     └─ todo/
├─ test/
└─ README.md
```

## 路由约定

- `/`：启动页
- `/login`：登录页
- `/home`：首页
- `/schools`：择校列表页
- `/schools/detail`：院校详情页
- `/planning`：规划页
- `/todo`：Todo 页
- `/resources`：资料页占位
- `/profile`：我的页

说明：

1. `规划页` 和 `Todo 页` 当前带基础登录保护。
2. 游客默认可从启动页进入择校页体验。
3. 登录成功后会按骨架逻辑跳回目标路由。

## 状态管理预留

当前没有强绑定第三方方案，而是先把边界搭好：

1. `AppSessionStore`：管理登录态
2. `AppBootstrap`：集中初始化 repository / api / store
3. `AppScope`：向页面树提供依赖

这样后续切换到 Riverpod、Bloc 或 Provider 时，不需要重做 feature 目录。

## API 层预留

客户端侧只做结构预留，不修改 `services/api`：

1. `core/network/api_client.dart`：统一请求入口占位
2. `features/*/data/*_api.dart`：接口路径映射
3. `features/*/data/*_repository.dart`：页面调用边界

目前已按文档预留的重点资源包括：

- `auth`
- `schools`
- `study-plans`
- `weekly-plans`
- `daily-plans`
- `todo-items`
- `users/me`
- `user-targets/current`

## 页面现状

以下页面当前属于“骨架 / 占位页”，主要完成结构和导航，不包含真实业务接口联调：

- 启动页
- 登录页
- 首页
- 择校列表页
- 院校详情页
- 规划页
- Todo 页
- 我的页
- 资料页占位

## 如何运行 Android 版本

已安装 Flutter SDK：`D:\dev\flutter`

在仓库根目录执行：

```bash
cd apps/mobile
D:\dev\flutter\bin\flutter.bat pub get
D:\dev\flutter\bin\flutter.bat run -d <android-device-id>
```

如果要先查看当前环境：

```bash
D:\dev\flutter\bin\flutter.bat doctor -v
```

说明：

1. 当前 Flutter SDK 已就位。
2. Android SDK 仍需配置到本机后，`flutter run` 才能真正启动 Android 设备或模拟器。
3. Android 包名当前为 `com.suregrad.mobile`。

## 相关文档

- [移动端架构说明](C:/Users/hp/Documents/SureGrad/docs/mobile-architecture.md)
- [PRD](C:/Users/hp/Documents/SureGrad/docs/prd.md)
- [UX Flow](C:/Users/hp/Documents/SureGrad/docs/ux-flow.md)
- [API Spec](C:/Users/hp/Documents/SureGrad/docs/api-spec.md)
