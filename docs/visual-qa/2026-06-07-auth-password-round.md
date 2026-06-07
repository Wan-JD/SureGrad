# 2026-06-07 账号密码认证与后台账号展示视觉验收

## 范围

- 移动端登录页：账号密码登录、账号密码注册、注册图形验证码、游客浏览入口；新增 `mobile-auth-login.png` 直接截图覆盖登录入口。
- 移动端个人中心：统一展示 `accountLabel`，兼容手机号与邮箱账号。
- 后台用户管理：App 用户列表改为展示统一账号标签，支持手机号、邮箱、昵称搜索。

## 验收命令

```bash
pnpm verify:api
pnpm verify:admin
pnpm verify:mobile
ADMIN_BASE_URL=http://127.0.0.1:3003 node tools/visual-qa/capture-admin.mjs
node tools/visual-qa/run-mobile-visual.mjs
```

## 结果

- API：20 个测试套件、120 项测试通过；覆盖账密注册、账密登录、重复注册 `ACCOUNT_EXISTS`、邮箱账号投影。
- Admin：构建与 lint 通过；Admin 视觉 QA 通过，截图输出到 `docs/.visual-qa/`。
- Mobile：`flutter analyze` 通过，22 项 Flutter 测试通过；移动端视觉 QA 通过，截图输出到 `docs/.visual-qa/`。
- 运行时认证：本地 API 完成真实 HTTP 注册、登录、重复注册 409 验证；数据库 `password_hash` 前缀为 `scrypt`，不是明文密码。

## 结论

本轮页面无白屏、无关键内容缺失；账密认证主流程和后台账号展示可进入下一轮数据/功能扩展。
