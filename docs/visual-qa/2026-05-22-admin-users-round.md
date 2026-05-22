# 视觉验收：后台用户与权限管理

**日期**：2026-05-22  
**范围**：Admin 登录鉴权、App 用户管理、超级管理员后台账号管理

## 截图结论

| 页面 | 视口 | 结果 | 备注 |
|------|------|------|------|
| `/login` | — | 通过 | Playwright 先登录再截图 |
| `/users` | desktop / tablet / mobile | **通过** | 列表、筛选、详情与「停用选中账号」工具条可见 |
| `/admins` | desktop / tablet / mobile | **通过** | 超级管理员可见两名后台账号与角色操作条 |
| 既有学校/专业/资料等页 | 全视口 | **通过** | 登录态下复拍 |

截图目录：`docs/.visual-qa/`（含 `admin-users-*`、`admin-admins-*`）

## 自动化检查

| 命令 | 结果 |
|------|------|
| `pnpm verify:api` | **通过**（含 admin 模块单测） |
| `pnpm verify:admin` | **通过** |
| `pnpm verify:mobile` | **通过** |
| `pnpm verify:visual` | **通过**（Admin + Mobile） |

## 功能摘要

- 新增 `admin_users` 表与种子账号：`superadmin` / `super123`，`admin` / `admin123`
- API：`POST /admin/auth/login`、`GET /admin/auth/me`、`GET/PATCH /admin/app-users`、`GET/POST/PATCH /admin/staff`（staff 仅 `super_admin`）
- Admin：登录页、会话守卫、用户管理页；超级管理员侧栏入口「管理员账号」
