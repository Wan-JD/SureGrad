# SureGrad Codex 会话提示词模板

版本：`v0.1`

日期：`2026-05-17`

## 1. 使用原则

后续所有 Codex 会话统一遵循以下命名与路径规则：

1. 项目 / 仓库 / 工作区统一称为 `SureGrad`
2. 工作区路径统一写为 `C:\Users\hp\Documents\SureGrad`
3. 不要在新提示词里再使用 `一研为定` 作为本地文件夹名
4. 中文品牌名 `一研为定` 仅在产品文案、品牌讨论或展示命名时使用

## 2. 通用提示词开头

建议所有新会话都以类似下面这段开头：

```text
请基于 SureGrad 当前仓库继续工作。
工作区路径统一使用：
C:\Users\hp\Documents\SureGrad

参考文档请优先使用 docs 目录下已有文件。
如果涉及本地路径、输出文件路径或文档链接，请统一使用 SureGrad 英文路径，不要使用旧的中文文件夹路径。
```

## 3. 文档线程模板

```text
请基于 SureGrad 当前仓库继续工作。
工作区路径统一使用：
C:\Users\hp\Documents\SureGrad

任务：
基于以下文档继续输出新文档或修订现有文档：
1. docs/project-plan.md
2. docs/prd.md
3. docs/database-design.md

要求：
1. 所有输出文件都放在 SureGrad 仓库内
2. 所有本地路径使用 C:\Users\hp\Documents\SureGrad
3. 不要再引用旧路径 C:\Users\hp\Documents\一研为定
4. 完成后列出改动文件，不要直接提交 git
```

## 4. 后端线程模板

```text
请基于 SureGrad 当前仓库继续工作。
工作区路径统一使用：
C:\Users\hp\Documents\SureGrad

任务：
在 services/api 下继续完成后端工作。

要求：
1. 参考 docs/api-spec.md、docs/database-design.md、docs/schema.sql
2. 不要修改 apps/mobile
3. 所有路径说明和 README 链接使用 SureGrad 英文路径
4. 完成后列出改动文件，不要直接提交 git
```

## 5. 移动端线程模板

```text
请基于 SureGrad 当前仓库继续工作。
工作区路径统一使用：
C:\Users\hp\Documents\SureGrad

任务：
在 apps/mobile 下继续完成 Flutter 移动端工作。

要求：
1. 参考 docs/prd.md、docs/ux-flow.md、docs/api-spec.md
2. 不要修改 services/api
3. 所有路径说明和 README 链接使用 SureGrad 英文路径
4. 完成后列出改动文件，不要直接提交 git
```

## 6. 主控窗口模板

```text
请基于 SureGrad 当前仓库继续工作。
工作区路径统一使用：
C:\Users\hp\Documents\SureGrad

任务：
1. 审阅当前仓库所有新增或修改内容
2. 统一文档、命名、路径和实现边界
3. 修复明显冲突
4. 如果检查通过，再帮我提交并推送

注意：
所有后续说明、文件链接和会话建议都统一使用 SureGrad 英文路径。
```
