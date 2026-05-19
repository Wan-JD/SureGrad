# SureGrad Codex 会话提示词模板

版本：`v0.2`

日期：`2026-05-19`

## 1. 使用原则

后续所有 Codex 会话统一遵循以下命名与路径规则：

1. 项目 / 仓库 / 工作区统一称为 `SureGrad`
2. 工作区路径统一写为 `C:\Users\hp\Documents\SureGrad`
3. 新对话开始后，先读 `docs/start-here.md`
4. 中文品牌名 `一研为定` 仅在产品文案、品牌讨论或展示命名时使用
5. 不要依赖聊天记录恢复现场

## 2. 通用提示词开头

建议所有新会话都以类似下面这段开头：

```text
请基于 SureGrad 当前仓库继续工作。
工作区路径统一使用：
C:\Users\hp\Documents\SureGrad

接手后先读：
1. docs/start-here.md
2. README.md

参考文档请优先使用 docs 目录下已有文件。
如果涉及本地路径、输出文件路径或文档链接，请统一使用 SureGrad 英文路径。
不要依赖聊天记录恢复现场。
如果任务明显匹配已安装的 skill，请优先使用对应 skill。
```

## 3. 文档线程模板

```text
请基于 SureGrad 当前仓库继续工作。
工作区路径统一使用：
C:\Users\hp\Documents\SureGrad

接手后先读：
1. docs/start-here.md
2. README.md

任务：
基于以下文档继续输出新文档或修订现有文档：
1. docs/project-plan.md
2. docs/prd.md
3. docs/database-design.md

要求：
1. 所有输出文件都放在 SureGrad 仓库内
2. 所有本地路径使用 C:\Users\hp\Documents\SureGrad
3. 不要依赖聊天记录恢复现场
4. 完成后列出改动文件，不要直接提交 git
```

## 4. 后端线程模板

```text
请基于 SureGrad 当前仓库继续工作。
工作区路径统一使用：
C:\Users\hp\Documents\SureGrad

接手后先读：
1. docs/start-here.md
2. docs/prd.md
3. docs/api-spec.md
4. docs/database-design.md
5. docs/schema.sql
6. docs/backend-architecture.md

任务：
在 services/api 下继续完成后端工作。

要求：
1. 参考 docs/api-spec.md、docs/database-design.md、docs/schema.sql、docs/backend-architecture.md
2. 不要修改 apps/mobile
3. 所有路径说明和 README 链接使用 SureGrad 英文路径
4. 完成后列出改动文件，不要直接提交 git
```

## 5. 移动端线程模板

```text
请基于 SureGrad 当前仓库继续工作。
工作区路径统一使用：
C:\Users\hp\Documents\SureGrad

接手后先读：
1. docs/start-here.md
2. docs/prd.md
3. docs/ux-flow.md
4. docs/api-spec.md
5. docs/mobile-architecture.md

任务：
在 apps/mobile 下继续完成 Flutter 移动端工作。

要求：
1. 参考 docs/prd.md、docs/ux-flow.md、docs/api-spec.md
2. 不要修改 services/api
3. 所有路径说明和 README 链接使用 SureGrad 英文路径
4. 如果涉及页面改动，完成后要做视觉验收
5. 完成后列出改动文件，不要直接提交 git
```

## 6. 后台线程模板

```text
请基于 SureGrad 当前仓库继续工作。
工作区路径统一使用：
C:\Users\hp\Documents\SureGrad

接手后先读：
1. docs/start-here.md
2. docs/prd.md
3. docs/database-design.md
4. docs/schema.sql
5. docs/data-import-plan.md
6. apps/admin/README.md

任务：
在 apps/admin 下继续完成运营后台工作。

要求：
1. 优先保证运营视角，不要把原始 id、表名和工程枚举当成主信息展示
2. 参考 docs/database-design.md、docs/schema.sql、docs/data-import-plan.md
3. 所有路径说明和 README 链接使用 SureGrad 英文路径
4. 如果涉及页面改动，完成后要做视觉验收
5. 完成后列出改动文件，不要直接提交 git
```

## 7. 数据采集线程模板

```text
请基于 SureGrad 当前仓库继续工作。
工作区路径统一使用：
C:\Users\hp\Documents\SureGrad

接手后先读：
1. docs/start-here.md
2. docs/data-import-plan.md
3. docs/database-design.md
4. docs/schema.sql
5. tools/data-import/README.md

任务：
在 tools/data-import 下继续完成真实数据采集、模板补齐或导入工具链相关工作。

要求：
1. 每个真实批次都要保留来源链接、核验时间和批次 README
2. 以 schema.sql 为字段与约束事实来源
3. 完成后至少说明是否跑过 validate_csv.py
4. 不要直接提交 git
```

## 8. 主控窗口模板

```text
请基于 SureGrad 当前仓库继续工作。
工作区路径统一使用：
C:\Users\hp\Documents\SureGrad

接手后先读：
1. docs/start-here.md
2. README.md
3. docs/project-plan.md
4. docs/prd.md
5. docs/api-spec.md
6. docs/database-design.md
7. docs/schema.sql
8. docs/codex-session-prompts.md

任务：
1. 审阅当前仓库所有新增或修改内容
2. 统一文档、命名、路径和实现边界
3. 修复明显冲突
4. 如果检查通过，再帮我提交并推送

注意：
所有后续说明、文件链接和会话建议都统一使用 SureGrad 英文路径。
不要依赖聊天记录恢复现场。
```
