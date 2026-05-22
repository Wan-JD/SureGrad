# 视觉验收：Admin 学校写接口

**日期**：2026-05-22  
**范围**：`/admin/schools` 运营列表、详情、启用/停用写操作

## 截图结论

| 页面 | 视口 | 结果 | 备注 |
|------|------|------|------|
| `/`（登录后重定向） | 全视口 | **通过** | 落至用户管理页 |
| `/schools` | desktop / tablet / mobile | **通过** | 工具条含「写接口」与启停按钮 |
| 其余 Admin / Mobile | 全视口 | **通过** | 复拍 `docs/.visual-qa/` |

## 自动化检查

| 命令 | 结果 |
|------|------|
| `pnpm verify:api` | **通过** |
| `pnpm verify:admin` | **通过** |
| `pnpm verify:visual`（Admin 段） | **通过** |

## 功能摘要

- `GET/POST/PATCH /admin/schools`、 `GET /admin/schools/:id`
- 学校管理页改接 Admin API，支持状态筛选与启用/停用
- 登录后访问 `/` 重定向至 `/users`
- `docs/api-spec.md` 增补 §19 管理后台接口
