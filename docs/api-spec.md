# SureGrad MVP 接口设计文档

版本：`v0.2`

日期：`2026-05-16`

关联文档：

- `docs/project-plan.md`
- `docs/prd.md`
- `docs/database-design.md`

适用范围：`SureGrad Android MVP / REST API`

## 1. 文档目标

本文档基于 `docs/project-plan.md`、`docs/prd.md`、`docs/database-design.md`，输出 SureGrad MVP 阶段后端接口设计，服务以下核心闭环：

`登录 -> 择校 -> 院校详情/专业详情 -> 收藏/对比 -> 目标设置 -> 学习计划 -> 周计划/日计划 -> Todo -> 打卡 -> 资料推荐 -> 提醒中心`

本文档仅服务 MVP，不扩展社区、AI 对话、调剂、即时聊天等非 MVP 能力。

## 2. 设计原则

1. 接口命名尽量与数据模型保持一致，优先使用 `schools`、`programs`、`favorites`、`comparison-items`、`user-targets`、`study-plans`、`weekly-plans`、`daily-plans`、`todo-items`、`study-checkins`、`study-resources`、`reminders` 等资源名。
2. 择校关键数据必须带年份维度，并保留来源、可信度、更新时间。
3. 游客仅可浏览择校与资料公开信息；收藏、对比、目标、计划、Todo、打卡、提醒均要求登录。
4. MVP 优先保证“可实现、可联调、可测试”，不提前设计复杂推荐算法、实时协作或 AI 流程。
5. MVP 对比接口以前台 `programs` 粒度为准，避免学校级聚合导致分数线、报录比和复录比口径不一致。

## 3. 通用约定

### 3.1 基础规范

- Base URL：`/api/v1`
- 协议：`HTTPS`
- 请求与响应格式：`application/json; charset=utf-8`
- 主键类型：`UUID`
- 时间格式：RFC 3339，例如 `2026-05-16T09:30:00+08:00`
- 日期格式：`YYYY-MM-DD`

### 3.2 鉴权规范

- 登录态通过请求头 `Authorization: Bearer <accessToken>` 传递。
- 登录成功返回：
  - `accessToken`
  - `refreshToken`
  - `expiresIn`
- 游客态不传 token。

### 3.3 统一响应结构

成功响应：

```json
{
  "requestId": "caa8e0d7-bc5a-492d-9a52-f53691f4d0d7",
  "data": {},
  "meta": {}
}
```

失败响应：

```json
{
  "requestId": "caa8e0d7-bc5a-492d-9a52-f53691f4d0d7",
  "error": {
    "code": "INVALID_PARAMS",
    "message": "请求参数不合法",
    "details": {}
  }
}
```

### 3.4 分页规范

分页列表统一使用：

- `page`：页码，从 `1` 开始
- `pageSize`：每页条数，默认 `20`，最大 `50`

分页响应统一返回：

```json
{
  "items": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 0,
    "hasMore": false
  }
}
```

### 3.5 排序规范

- 列表接口使用 `sortBy` + `sortOrder`。
- `sortOrder` 允许值：`asc` / `desc`。
- 未声明时使用该接口的默认排序规则。

### 3.6 通用错误码

| 错误码                    | HTTP | 说明                   |
| ------------------------- | ---- | ---------------------- |
| `INVALID_PARAMS`          | 400  | 参数校验失败           |
| `UNAUTHORIZED`            | 401  | 未登录或 token 无效    |
| `FORBIDDEN`               | 403  | 无权限访问             |
| `NOT_FOUND`               | 404  | 资源不存在             |
| `OTP_SEND_FAILED`         | 400  | 验证码发送失败         |
| `OTP_INVALID`             | 400  | 验证码错误或已过期     |
| `PROFILE_INCOMPLETE`      | 400  | 用户档案未补全         |
| `TARGET_REQUIRED`         | 400  | 当前操作需要先设置目标 |
| `PLAN_ALREADY_EXISTS`     | 409  | 已存在激活学习计划     |
| `FAVORITE_DUPLICATED`     | 409  | 重复收藏               |
| `COMPARE_ITEM_DUPLICATED` | 409  | 重复加入对比           |
| `COMPARE_LIMIT_EXCEEDED`  | 400  | 超出对比上限           |
| `TODO_ALREADY_COMPLETED`  | 409  | Todo 已完成            |
| `CHECKIN_ALREADY_EXISTS`  | 409  | 当日已打卡             |
| `REMINDER_CONFLICT`       | 409  | 提醒时间或类型冲突     |

## 4. 接口总览

| 模块               | 接口                                                                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 登录与用户基础档案 | `POST /auth/otp/send`、`POST /auth/login/otp`、`GET /users/me`、`PUT /user-profiles/me`                                                              |
| 择校列表           | `GET /schools`                                                                                                                                       |
| 院校详情           | `GET /schools/{schoolId}`、`GET /schools/{schoolId}/programs`                                                                                        |
| 专业详情           | `GET /programs/{programId}`                                                                                                                          |
| 收藏               | `POST /favorites`、`DELETE /favorites`、`GET /favorites`                                                                                             |
| 对比               | `POST /comparison-items`、`DELETE /comparison-items`、`GET /comparison-items/result`                                                                 |
| 用户目标设置       | `PUT /user-targets/current`、`GET /user-targets/current`                                                                                             |
| 学习计划           | `POST /study-plans/generate`、`GET /study-plans/current`                                                                                             |
| 周计划 / 日计划    | `GET /weekly-plans`、`PATCH /weekly-plans/{weeklyPlanId}`、`GET /daily-plans`、`PATCH /daily-plans/{dailyPlanId}`                                    |
| Todo               | `GET /todo-items`、`POST /todo-items`、`PATCH /todo-items/{todoItemId}`、`POST /todo-items/{todoItemId}/complete`、`DELETE /todo-items/{todoItemId}` |
| 打卡               | `GET /study-checkins/today`、`POST /study-checkins`、`PATCH /study-checkins/{checkinId}`、`GET /study-stats/overview`                                |
| 资料推荐           | `GET /study-resources`、`GET /study-resources/{resourceId}`                                                                                          |
| 提醒中心           | `GET /reminders`、`POST /reminders`、`PATCH /reminders/{reminderId}`、`DELETE /reminders/{reminderId}`                                               |

## 5. 登录与用户基础档案

### 5.1 发送验证码

- Method：`POST`
- Path：`/auth/otp/send`
- 用途：发送手机号登录验证码
- 是否需要登录：否

请求参数：

| 字段    | 类型   | 必填 | 说明         |
| ------- | ------ | ---- | ------------ |
| `phone` | string | 是   | 手机号       |
| `scene` | string | 是   | 固定 `login` |

响应结构：

| 字段                | 类型    | 说明         |
| ------------------- | ------- | ------------ |
| `sent`              | boolean | 是否发送成功 |
| `expireSeconds`     | number  | 验证码有效期 |
| `retryAfterSeconds` | number  | 重发等待时间 |

错误场景：

1. 手机号格式错误：`INVALID_PARAMS`
2. 短时间重复发送：`INVALID_PARAMS`
3. 短信服务不可用：`OTP_SEND_FAILED`

### 5.2 验证码登录

- Method：`POST`
- Path：`/auth/login/otp`
- 用途：验证码登录；用户不存在时自动注册 `users`
- 是否需要登录：否

请求参数：

| 字段       | 类型   | 必填 | 说明     |
| ---------- | ------ | ---- | -------- |
| `phone`    | string | 是   | 手机号   |
| `otpCode`  | string | 是   | 验证码   |
| `deviceId` | string | 否   | 设备标识 |

响应结构：

| 字段               | 类型    | 说明           |
| ------------------ | ------- | -------------- |
| `accessToken`      | string  | 访问 token     |
| `refreshToken`     | string  | 刷新 token     |
| `expiresIn`        | number  | 有效秒数       |
| `isNewUser`        | boolean | 是否新用户     |
| `profileCompleted` | boolean | 是否已补全档案 |
| `user`             | object  | 用户基础信息   |

错误场景：

1. 手机号或验证码为空：`INVALID_PARAMS`
2. 验证码错误或过期：`OTP_INVALID`
3. 用户状态被禁用：`FORBIDDEN`

### 5.3 获取当前用户信息

- Method：`GET`
- Path：`/users/me`
- 用途：获取当前用户基础信息与用户侧全局状态
- 是否需要登录：是

请求参数：无

响应结构：

| 字段               | 类型           | 说明             |
| ------------------ | -------------- | ---------------- |
| `userId`           | string         | 用户 ID          |
| `phoneMasked`      | string         | 脱敏手机号       |
| `nickname`         | string         | 昵称             |
| `avatarUrl`        | string \| null | 头像             |
| `profileCompleted` | boolean        | 是否已补全档案   |
| `hasActiveTarget`  | boolean        | 是否存在激活目标 |
| `hasActivePlan`    | boolean        | 是否存在激活计划 |

错误场景：

1. 未登录：`UNAUTHORIZED`
2. 用户不存在：`NOT_FOUND`

### 5.4 更新用户基础档案

- Method：`PUT`
- Path：`/user-profiles/me`
- 用途：创建或更新 `user_profiles`
- 是否需要登录：是

请求参数：

| 字段                  | 类型    | 必填 | 说明                               |
| --------------------- | ------- | ---- | ---------------------------------- |
| `nickname`            | string  | 否   | 昵称                               |
| `avatarUrl`           | string  | 否   | 头像                               |
| `examYear`            | number  | 是   | 备考年份                           |
| `identityType`        | string  | 是   | `fresh` / `second_try` / `working` |
| `undergraduateMajor`  | string  | 是   | 本科专业                           |
| `intendedDiscipline`  | string  | 是   | 意向专业方向                       |
| `dailyStudyHours`     | number  | 是   | 每日可投入学习时长                 |
| `examMathRequired`    | boolean | 是   | 是否考数学                         |
| `onboardingCompleted` | boolean | 否   | 是否完成引导                       |

响应结构：

| 字段                  | 类型    | 说明         |
| --------------------- | ------- | ------------ |
| `userProfileId`       | string  | 档案 ID      |
| `examYear`            | number  | 备考年份     |
| `identityType`        | string  | 当前身份     |
| `dailyStudyHours`     | number  | 每日学习时长 |
| `onboardingCompleted` | boolean | 是否完成引导 |

错误场景：

1. 必填字段缺失：`INVALID_PARAMS`
2. `dailyStudyHours <= 0`：`INVALID_PARAMS`
3. 未登录：`UNAUTHORIZED`

## 6. 择校列表

### 6.1 获取择校列表

- Method：`GET`
- Path：`/schools`
- 用途：返回择校列表页数据，支持搜索、筛选、分页、排序
- 是否需要登录：否

请求参数：

| 参数                 | 类型    | 必填 | 说明                                                              |
| -------------------- | ------- | ---- | ----------------------------------------------------------------- |
| `q`                  | string  | 否   | 关键词，支持学校名、院系名、专业名                                |
| `province`           | string  | 否   | 省份                                                              |
| `city`               | string  | 否   | 城市                                                              |
| `schoolLevel`        | string  | 否   | 学校层次                                                          |
| `schoolType`         | string  | 否   | 学校类型                                                          |
| `disciplineCategory` | string  | 否   | 学科门类                                                          |
| `degreeType`         | string  | 否   | `academic` / `professional`                                       |
| `examMathRequired`   | boolean | 否   | 是否考数学                                                        |
| `examYear`           | number  | 否   | 查询年份，默认最近有效年份                                        |
| `sortBy`             | string  | 否   | `recommended` / `score_line` / `application_ratio` / `updated_at` |
| `sortOrder`          | string  | 否   | `asc` / `desc`                                                    |
| `page`               | number  | 否   | 页码                                                              |
| `pageSize`           | number  | 否   | 每页条数                                                          |

筛选与排序规则：

1. 默认排序：`sortBy=recommended&sortOrder=desc`
2. 搜索优先匹配学校名，其次匹配院系名和专业名
3. 筛选条件多选时取交集
4. 分页默认 `20` 条，最大 `50` 条

响应结构：

| 字段         | 类型   | 说明         |
| ------------ | ------ | ------------ |
| `items`      | array  | 学校卡片列表 |
| `pagination` | object | 分页信息     |

`items` 列表项：

| 字段                      | 类型           | 说明               |
| ------------------------- | -------------- | ------------------ |
| `schoolId`                | string         | 学校 ID            |
| `schoolName`              | string         | 学校名称           |
| `province`                | string         | 省份               |
| `city`                    | string         | 城市               |
| `schoolLevel`             | string         | 学校层次           |
| `schoolType`              | string         | 学校类型           |
| `matchedPrograms`         | array          | 命中专业摘要       |
| `scoreLineSummary`        | object \| null | 最近年份分数线摘要 |
| `applicationRatioSummary` | object \| null | 最近年份报录比摘要 |
| `missingFlags`            | array          | 缺失字段标记       |
| `isFavorited`             | boolean        | 是否已收藏         |

错误场景：

1. 页码或分页大小非法：`INVALID_PARAMS`
2. 排序字段不支持：`INVALID_PARAMS`
3. 查询年份非法：`INVALID_PARAMS`

## 7. 院校详情

### 7.1 获取院校详情

- Method：`GET`
- Path：`/schools/{schoolId}`
- 用途：获取学校基础信息与院校详情页顶层摘要
- 是否需要登录：否

请求参数：

路径参数：

| 参数       | 类型   | 说明    |
| ---------- | ------ | ------- |
| `schoolId` | string | 学校 ID |

查询参数：

| 参数       | 类型   | 必填 | 说明             |
| ---------- | ------ | ---- | ---------------- |
| `examYear` | number | 否   | 当前优先展示年份 |

响应结构：

| 字段                | 类型           | 说明           |
| ------------------- | -------------- | -------------- |
| `schoolId`          | string         | 学校 ID        |
| `schoolName`        | string         | 学校名称       |
| `shortName`         | string \| null | 学校简称       |
| `province`          | string         | 省份           |
| `city`              | string         | 城市           |
| `schoolType`        | string         | 学校类型       |
| `schoolLevel`       | string         | 学校层次       |
| `hasGraduateSchool` | boolean        | 是否有研究生院 |
| `officialWebsite`   | string \| null | 学校官网       |
| `graduateWebsite`   | string \| null | 研究生院官网   |
| `description`       | string \| null | 简介           |
| `programCount`      | number         | 专业数量       |
| `hotPrograms`       | array          | 热门专业摘要   |
| `isFavorited`       | boolean        | 是否已收藏     |

错误场景：

1. `schoolId` 不存在：`NOT_FOUND`
2. 查询年份非法：`INVALID_PARAMS`

### 7.2 获取院校下专业列表

- Method：`GET`
- Path：`/schools/{schoolId}/programs`
- 用途：查看学校下可报考专业列表，用于院校详情页内筛选与跳转专业详情
- 是否需要登录：否

请求参数：

| 参数                 | 类型    | 必填 | 说明                                                           |
| -------------------- | ------- | ---- | -------------------------------------------------------------- |
| `departmentId`       | string  | 否   | 院系 ID                                                        |
| `degreeType`         | string  | 否   | `academic` / `professional`                                    |
| `disciplineCategory` | string  | 否   | 学科门类                                                       |
| `examMathRequired`   | boolean | 否   | 是否考数学                                                     |
| `examYear`           | number  | 否   | 展示年份                                                       |
| `sortBy`             | string  | 否   | `recommended` / `score_line` / `application_ratio` / `tuition` |
| `sortOrder`          | string  | 否   | `asc` / `desc`                                                 |
| `page`               | number  | 否   | 页码                                                           |
| `pageSize`           | number  | 否   | 每页数量                                                       |

筛选与排序规则：

1. 默认排序：`recommended desc`
2. 同一院校下支持按院系、学位类型、学科门类筛选
3. 分页默认 `20` 条

响应结构：

| 字段         | 类型   | 说明     |
| ------------ | ------ | -------- |
| `items`      | array  | 专业列表 |
| `pagination` | object | 分页信息 |

`items` 列表项：

| 字段                      | 类型           | 说明         |
| ------------------------- | -------------- | ------------ |
| `programId`               | string         | 专业 ID      |
| `programName`             | string         | 专业名称     |
| `programCode`             | string         | 专业代码     |
| `departmentId`            | string         | 院系 ID      |
| `departmentName`          | string         | 院系名称     |
| `degreeType`              | string         | 学位类型     |
| `disciplineCategory`      | string         | 学科门类     |
| `researchDirection`       | string \| null | 研究方向     |
| `scoreLineSummary`        | object \| null | 分数线摘要   |
| `applicationRatioSummary` | object \| null | 报录比摘要   |
| `interviewRatioSummary`   | object \| null | 复录比摘要   |
| `isFavorited`             | boolean        | 是否收藏     |
| `isInComparison`          | boolean        | 是否在对比池 |

错误场景：

1. `schoolId` 不存在：`NOT_FOUND`
2. 排序字段非法：`INVALID_PARAMS`
3. 院系 ID 与学校不匹配：`INVALID_PARAMS`

## 8. 专业详情

### 8.1 获取专业详情

- Method：`GET`
- Path：`/programs/{programId}`
- 用途：获取专业详情页的完整择校数据
- 是否需要登录：否

请求参数：

路径参数：

| 参数        | 类型   | 说明    |
| ----------- | ------ | ------- |
| `programId` | string | 专业 ID |

查询参数：

| 参数        | 类型   | 必填 | 说明                                         |
| ----------- | ------ | ---- | -------------------------------------------- |
| `examYears` | string | 否   | 年份列表，如 `2023,2024,2025`；默认最近 3 年 |

响应结构：

| 字段                      | 类型           | 说明                         |
| ------------------------- | -------------- | ---------------------------- |
| `programId`               | string         | 专业 ID                      |
| `programName`             | string         | 专业名                       |
| `programCode`             | string         | 专业代码                     |
| `degreeType`              | string         | `academic` / `professional`  |
| `disciplineCategory`      | string         | 学科门类                     |
| `researchDirection`       | string \| null | 研究方向                     |
| `school`                  | object         | 学校摘要                     |
| `department`              | object         | 院系摘要                     |
| `scoreLineSummary`        | object \| null | 最近年份分数线摘要           |
| `applicationRatioSummary` | object \| null | 最近年份报录比摘要           |
| `interviewRatioSummary`   | object \| null | 最近年份复录比摘要           |
| `admissions`              | array          | 招生信息                     |
| `scoreLines`              | array          | 分数线信息                   |
| `applicationStats`        | array          | 报录比信息                   |
| `interviewStats`          | array          | 复录比信息                   |
| `examSubjects`            | array          | 初试科目                     |
| `referenceBooks`          | array          | 参考书                       |
| `sourceLinks`             | array          | 官方来源链接                 |
| `dataUpdatedAt`           | string \| null | 数据更新时间                 |
| `disclaimer`              | string         | 固定返回“以官方最新公告为准” |
| `isFavorited`             | boolean        | 是否已收藏                   |
| `isInComparison`          | boolean        | 是否已加入对比               |

`school` 对象：

| 字段                | 类型           | 说明           |
| ------------------- | -------------- | -------------- |
| `schoolId`          | string         | 学校 ID        |
| `schoolName`        | string         | 学校名称       |
| `shortName`         | string         | 学校简称       |
| `province`          | string         | 省份           |
| `city`              | string         | 城市           |
| `schoolType`        | string         | 学校类型       |
| `schoolLevel`       | string         | 学校层次       |
| `hasGraduateSchool` | boolean        | 是否有研究生院 |
| `officialWebsite`   | string \| null | 学校官网       |
| `graduateWebsite`   | string \| null | 研究生院官网   |

`department` 对象：

| 字段             | 类型           | 说明     |
| ---------------- | -------------- | -------- |
| `departmentId`   | string         | 院系 ID  |
| `departmentName` | string         | 院系名称 |
| `departmentCode` | string \| null | 院系代码 |
| `website`        | string \| null | 院系站点 |

`scoreLineSummary` 对象：

| 字段            | 类型   | 说明                                              |
| --------------- | ------ | ------------------------------------------------- |
| `examYear`      | number | 年份                                              |
| `totalScore`    | number | 总分线                                            |
| `scoreLineType` | string | `school` / `retest` / `national_a` / `national_b` |

`applicationRatioSummary` 对象：

| 字段               | 类型   | 说明     |
| ------------------ | ------ | -------- |
| `examYear`         | number | 年份     |
| `applicationRatio` | number | 报录比   |
| `applicantCount`   | number | 报考人数 |
| `admittedCount`    | number | 录取人数 |

`interviewRatioSummary` 对象：

| 字段                   | 类型   | 说明         |
| ---------------------- | ------ | ------------ |
| `examYear`             | number | 年份         |
| `interviewRatio`       | number | 复录比       |
| `retestCandidateCount` | number | 进入复试人数 |
| `finalAdmittedCount`   | number | 最终录取人数 |

`admissions` 列表项：

| 字段                        | 类型           | 说明                                |
| --------------------------- | -------------- | ----------------------------------- |
| `examYear`                  | number         | 年份                                |
| `plannedEnrollment`         | number         | 计划招生人数                        |
| `recommendedExemptionCount` | number \| null | 推免人数                            |
| `unifiedExamQuota`          | number \| null | 统考名额                            |
| `actualEnrollment`          | number \| null | 实际录取人数                        |
| `isCrossMajorAllowed`       | boolean        | 是否允许跨考                        |
| `memo`                      | string \| null | 备注                                |
| `sourceConfidence`          | string         | `official` / `estimated` / `manual` |

`scoreLines` 列表项：

| 字段               | 类型           | 说明                                              |
| ------------------ | -------------- | ------------------------------------------------- |
| `examYear`         | number         | 年份                                              |
| `totalScore`       | number         | 总分线                                            |
| `politicsScore`    | number         | 政治单科线                                        |
| `englishScore`     | number         | 英语单科线                                        |
| `subjectOneScore`  | number         | 业务课一单科线                                    |
| `subjectTwoScore`  | number         | 业务课二单科线                                    |
| `scoreLineType`    | string         | `school` / `retest` / `national_a` / `national_b` |
| `notes`            | string \| null | 备注                                              |
| `sourceConfidence` | string         | `official` / `estimated` / `manual`               |

`applicationStats` 列表项：

| 字段               | 类型           | 说明                                |
| ------------------ | -------------- | ----------------------------------- |
| `examYear`         | number         | 年份                                |
| `applicantCount`   | number         | 报考人数                            |
| `actualExamCount`  | number \| null | 实考人数                            |
| `admittedCount`    | number         | 录取人数                            |
| `applicationRatio` | number         | 报录比                              |
| `notes`            | string \| null | 备注                                |
| `sourceConfidence` | string         | `official` / `estimated` / `manual` |

`interviewStats` 列表项：

| 字段                   | 类型           | 说明                                |
| ---------------------- | -------------- | ----------------------------------- |
| `examYear`             | number         | 年份                                |
| `retestCandidateCount` | number         | 进入复试人数                        |
| `finalAdmittedCount`   | number         | 最终录取人数                        |
| `interviewRatio`       | number         | 复录比                              |
| `retestWeight`         | number         | 复试权重                            |
| `initialExamWeight`    | number         | 初试权重                            |
| `notes`                | string \| null | 备注                                |
| `sourceConfidence`     | string         | `official` / `estimated` / `manual` |

`examSubjects` 列表项：

| 字段          | 类型           | 说明           |
| ------------- | -------------- | -------------- |
| `examYear`    | number         | 年份           |
| `subjectId`   | string         | 科目 ID        |
| `sequence`    | number         | 科目顺序       |
| `subjectRole` | string         | 科目角色       |
| `subjectCode` | string         | 展示用科目代码 |
| `subjectName` | string         | 展示用科目名称 |
| `notes`       | string \| null | 备注           |

`referenceBooks` 列表项：

| 字段          | 类型           | 说明         |
| ------------- | -------------- | ------------ |
| `examYear`    | number         | 年份         |
| `bookId`      | string         | 图书 ID      |
| `title`       | string         | 书名         |
| `author`      | string         | 作者         |
| `publisher`   | string         | 出版社       |
| `isbn`        | string \| null | ISBN         |
| `edition`     | string \| null | 版本         |
| `coverUrl`    | string \| null | 封面图       |
| `subjectRole` | string         | 对应科目角色 |
| `isRequired`  | boolean        | 是否必读     |
| `notes`       | string \| null | 备注         |

`sourceLinks` 列表项：

| 字段             | 类型           | 说明                             |
| ---------------- | -------------- | -------------------------------- |
| `sourceLinkId`   | string         | 来源链接 ID                      |
| `examYear`       | number \| null | 对应年份；为空表示通用来源       |
| `sourceType`     | string         | 来源类型                         |
| `title`          | string         | 标题                             |
| `url`            | string         | 链接地址                         |
| `publisherName`  | string         | 发布机构                         |
| `publishedAt`    | string \| null | 发布时间                         |
| `lastVerifiedAt` | string \| null | 最近校验时间                     |
| `status`         | string         | `active` / `invalid` / `pending` |
| `notes`          | string \| null | 备注                             |

错误场景：

1. `programId` 不存在：`NOT_FOUND`
2. 年份列表格式非法：`INVALID_PARAMS`
3. 查询年份超出支持范围：`INVALID_PARAMS`

## 9. 收藏

### 9.1 新增收藏

- Method：`POST`
- Path：`/favorites`
- 用途：收藏学校、专业或资料
- 是否需要登录：是

请求参数：

| 字段         | 类型   | 必填 | 说明                              |
| ------------ | ------ | ---- | --------------------------------- |
| `targetType` | string | 是   | `school` / `program` / `resource` |
| `targetId`   | string | 是   | 目标实体 ID                       |

响应结构：

| 字段         | 类型   | 说明        |
| ------------ | ------ | ----------- |
| `favoriteId` | string | 收藏记录 ID |
| `targetType` | string | 目标类型    |
| `targetId`   | string | 目标 ID     |
| `createdAt`  | string | 创建时间    |

错误场景：

1. 未登录：`UNAUTHORIZED`
2. `targetType` 不支持：`INVALID_PARAMS`
3. 目标不存在：`NOT_FOUND`
4. 重复收藏：`FAVORITE_DUPLICATED`

### 9.2 取消收藏

- Method：`DELETE`
- Path：`/favorites`
- 用途：取消收藏
- 是否需要登录：是

请求参数：

| 参数         | 类型   | 必填 | 说明                              |
| ------------ | ------ | ---- | --------------------------------- |
| `targetType` | string | 是   | `school` / `program` / `resource` |
| `targetId`   | string | 是   | 目标实体 ID                       |

响应结构：`204 No Content`

错误场景：

1. 未登录：`UNAUTHORIZED`
2. 收藏记录不存在：`NOT_FOUND`

### 9.3 获取收藏列表

- Method：`GET`
- Path：`/favorites`
- 用途：查看当前用户收藏列表
- 是否需要登录：是

请求参数：

| 参数         | 类型   | 必填 | 说明                              |
| ------------ | ------ | ---- | --------------------------------- |
| `targetType` | string | 否   | `school` / `program` / `resource` |
| `sortBy`     | string | 否   | `created_at`                      |
| `sortOrder`  | string | 否   | `asc` / `desc`                    |
| `page`       | number | 否   | 页码                              |
| `pageSize`   | number | 否   | 每页条数                          |

分页与排序规则：

1. 默认排序：`created_at desc`
2. 默认分页：`20` 条

响应结构：

| 字段         | 类型   | 说明     |
| ------------ | ------ | -------- |
| `items`      | array  | 收藏列表 |
| `pagination` | object | 分页信息 |

错误场景：

1. 未登录：`UNAUTHORIZED`
2. `targetType` 非法：`INVALID_PARAMS`

## 10. 对比

### 10.1 加入对比池

- Method：`POST`
- Path：`/comparison-items`
- 用途：将专业加入当前用户对比池
- 是否需要登录：是

请求参数：

| 字段         | 类型   | 必填 | 说明           |
| ------------ | ------ | ---- | -------------- |
| `targetType` | string | 是   | 固定 `program` |
| `targetId`   | string | 是   | 目标实体 ID    |

响应结构：

| 字段               | 类型   | 说明               |
| ------------------ | ------ | ------------------ |
| `comparisonItemId` | string | 对比项 ID          |
| `currentCount`     | number | 当前数量           |
| `maxCount`         | number | 最大数量，固定 `4` |

错误场景：

1. 未登录：`UNAUTHORIZED`
2. `targetType` 非 `program`：`INVALID_PARAMS`
3. 目标不存在：`NOT_FOUND`
4. 重复加入：`COMPARE_ITEM_DUPLICATED`
5. 超出上限：`COMPARE_LIMIT_EXCEEDED`

### 10.2 移出对比池

- Method：`DELETE`
- Path：`/comparison-items`
- 用途：移出对比池
- 是否需要登录：是

请求参数：

| 参数         | 类型   | 必填 | 说明           |
| ------------ | ------ | ---- | -------------- |
| `targetType` | string | 是   | 固定 `program` |
| `targetId`   | string | 是   | 目标实体 ID    |

响应结构：`204 No Content`

错误场景：

1. 未登录：`UNAUTHORIZED`
2. `targetType` 非 `program`：`INVALID_PARAMS`
3. 对比项不存在：`NOT_FOUND`

### 10.3 获取对比结果

- Method：`GET`
- Path：`/comparison-items/result`
- 用途：返回对比页核心数据
- 是否需要登录：是

请求参数：

| 参数       | 类型   | 必填 | 说明                           |
| ---------- | ------ | ---- | ------------------------------ |
| `examYear` | number | 否   | 优先对比年份，默认最近有效年份 |

筛选与排序规则：

1. 对比池内项目数量建议 `2-4`
2. 返回顺序按加入时间升序

响应结构：

| 字段         | 类型  | 说明         |
| ------------ | ----- | ------------ |
| `items`      | array | 对比对象列表 |
| `dimensions` | array | 对比维度定义 |

`items` 列表项：

| 字段                | 类型           | 说明           |
| ------------------- | -------------- | -------------- |
| `targetId`          | string         | 目标 ID        |
| `targetType`        | string         | 固定 `program` |
| `schoolName`        | string         | 学校名称       |
| `programName`       | string \| null | 专业名称       |
| `examYear`          | number \| null | 对比年份       |
| `totalScore`        | number \| null | 分数线         |
| `applicationRatio`  | number \| null | 报录比         |
| `interviewRatio`    | number \| null | 复录比         |
| `plannedEnrollment` | number \| null | 招生人数       |
| `tuitionPerYear`    | number \| null | 年学费         |
| `city`              | string         | 城市           |
| `examSubjects`      | array          | 初试科目       |
| `missingFlags`      | array          | 缺失字段标记   |

错误场景：

1. 未登录：`UNAUTHORIZED`
2. 对比池为空：`INVALID_PARAMS`
3. 查询年份非法：`INVALID_PARAMS`

## 11. 用户目标设置

### 11.1 设置当前目标

- Method：`PUT`
- Path：`/user-targets/current`
- 用途：创建或替换当前激活目标
- 是否需要登录：是

请求参数：

| 字段           | 类型   | 必填 | 说明     |
| -------------- | ------ | ---- | -------- |
| `schoolId`     | string | 是   | 学校 ID  |
| `departmentId` | string | 否   | 院系 ID  |
| `programId`    | string | 否   | 专业 ID  |
| `targetScore`  | number | 否   | 目标分数 |

响应结构：

| 字段            | 类型   | 说明     |
| --------------- | ------ | -------- |
| `userTargetId`  | string | 目标 ID  |
| `targetStatus`  | string | `active` |
| `selectedAt`    | string | 选择时间 |
| `targetSummary` | object | 目标摘要 |

错误场景：

1. 未登录：`UNAUTHORIZED`
2. 学校不存在：`NOT_FOUND`
3. 院系或专业与学校不匹配：`INVALID_PARAMS`
4. 目标分数非法：`INVALID_PARAMS`

### 11.2 获取当前目标

- Method：`GET`
- Path：`/user-targets/current`
- 用途：获取当前激活目标
- 是否需要登录：是

请求参数：无

响应结构：

| 字段           | 类型           | 说明     |
| -------------- | -------------- | -------- |
| `userTargetId` | string \| null | 目标 ID  |
| `schoolId`     | string \| null | 学校 ID  |
| `departmentId` | string \| null | 院系 ID  |
| `programId`    | string \| null | 专业 ID  |
| `targetScore`  | number \| null | 目标分数 |
| `targetStatus` | string \| null | 状态     |
| `selectedAt`   | string \| null | 设置时间 |

错误场景：

1. 未登录：`UNAUTHORIZED`

## 12. 学习计划

### 12.1 生成学习计划

- Method：`POST`
- Path：`/study-plans/generate`
- 用途：基于用户档案和目标生成 `study_plans`、`study_plan_phases`、`weekly_plans`、`daily_plans`
- 是否需要登录：是

请求参数：

| 字段              | 类型    | 必填 | 说明                                                       |
| ----------------- | ------- | ---- | ---------------------------------------------------------- |
| `templateType`    | string  | 是   | `standard` / `weak_foundation` / `cross_major` / `working` |
| `startDate`       | string  | 是   | 开始日期                                                   |
| `endDate`         | string  | 是   | 结束日期                                                   |
| `forceRegenerate` | boolean | 否   | 是否强制重生成                                             |

响应结构：

| 字段              | 类型   | 说明       |
| ----------------- | ------ | ---------- |
| `studyPlanId`     | string | 计划 ID    |
| `templateType`    | string | 模板类型   |
| `status`          | string | `active`   |
| `phaseCount`      | number | 阶段数量   |
| `weeklyPlanCount` | number | 周计划数量 |
| `dailyPlanCount`  | number | 日计划数量 |

错误场景：

1. 未登录：`UNAUTHORIZED`
2. 用户档案未补全：`PROFILE_INCOMPLETE`
3. 当前未设置目标：`TARGET_REQUIRED`
4. 计划日期区间非法：`INVALID_PARAMS`
5. 已存在激活计划且未强制重生成：`PLAN_ALREADY_EXISTS`

### 12.2 获取当前学习计划

- Method：`GET`
- Path：`/study-plans/current`
- 用途：获取当前激活学习计划总览
- 是否需要登录：是

请求参数：无

响应结构：

| 字段                 | 类型           | 说明           |
| -------------------- | -------------- | -------------- |
| `studyPlanId`        | string \| null | 计划 ID        |
| `title`              | string \| null | 计划标题       |
| `templateType`       | string \| null | 模板类型       |
| `startDate`          | string \| null | 开始日期       |
| `endDate`            | string \| null | 结束日期       |
| `status`             | string \| null | 状态           |
| `totalExpectedHours` | number \| null | 预计总时长     |
| `phases`             | array          | 阶段列表       |
| `currentWeek`        | object \| null | 当前周计划摘要 |
| `todayPlan`          | object \| null | 今日日计划摘要 |

错误场景：

1. 未登录：`UNAUTHORIZED`

## 13. 周计划 / 日计划

### 13.1 获取周计划

- Method：`GET`
- Path：`/weekly-plans`
- 用途：按学习计划或周起始日期查询周计划
- 是否需要登录：是

请求参数：

| 参数            | 类型   | 必填 | 说明                          |
| --------------- | ------ | ---- | ----------------------------- |
| `studyPlanId`   | string | 否   | 学习计划 ID；不传默认当前计划 |
| `weekStartDate` | string | 否   | 周起始日期；不传默认当前周    |

响应结构：

| 字段            | 类型           | 说明           |
| --------------- | -------------- | -------------- |
| `weeklyPlanId`  | string         | 周计划 ID      |
| `studyPlanId`   | string         | 学习计划 ID    |
| `phaseId`       | string \| null | 阶段 ID        |
| `title`         | string         | 标题           |
| `weekStartDate` | string         | 周开始日期     |
| `weekEndDate`   | string         | 周结束日期     |
| `goals`         | string \| null | 周目标         |
| `expectedHours` | number         | 预计时长       |
| `status`        | string         | 状态           |
| `dailyPlans`    | array          | 关联日计划摘要 |

错误场景：

1. 未登录：`UNAUTHORIZED`
2. 计划不存在：`NOT_FOUND`
3. 日期非法：`INVALID_PARAMS`

### 13.2 更新周计划

- Method：`PATCH`
- Path：`/weekly-plans/{weeklyPlanId}`
- 用途：手动调整周计划内容
- 是否需要登录：是

请求参数：

| 字段            | 类型   | 必填 | 说明                                         |
| --------------- | ------ | ---- | -------------------------------------------- |
| `title`         | string | 否   | 标题                                         |
| `goals`         | string | 否   | 周目标                                       |
| `expectedHours` | number | 否   | 预计时长                                     |
| `status`        | string | 否   | `draft` / `active` / `completed` / `skipped` |

响应结构：更新后的周计划对象

错误场景：

1. 未登录：`UNAUTHORIZED`
2. 周计划不存在：`NOT_FOUND`
3. `expectedHours < 0`：`INVALID_PARAMS`

### 13.3 获取日计划

- Method：`GET`
- Path：`/daily-plans`
- 用途：按日期查看日计划与关联 Todo
- 是否需要登录：是

请求参数：

| 参数          | 类型   | 必填 | 说明                          |
| ------------- | ------ | ---- | ----------------------------- |
| `studyPlanId` | string | 否   | 学习计划 ID；不传默认当前计划 |
| `date`        | string | 是   | 查询日期                      |

响应结构：

| 字段            | 类型           | 说明           |
| --------------- | -------------- | -------------- |
| `dailyPlanId`   | string \| null | 日计划 ID      |
| `studyPlanId`   | string \| null | 学习计划 ID    |
| `weeklyPlanId`  | string \| null | 周计划 ID      |
| `planDate`      | string         | 日期           |
| `title`         | string \| null | 标题           |
| `expectedHours` | number \| null | 预计时长       |
| `notes`         | string \| null | 备注           |
| `status`        | string \| null | 状态           |
| `todos`         | array          | 当日 Todo 列表 |

错误场景：

1. 未登录：`UNAUTHORIZED`
2. 日期非法：`INVALID_PARAMS`
3. 学习计划不存在：`NOT_FOUND`

### 13.4 更新日计划

- Method：`PATCH`
- Path：`/daily-plans/{dailyPlanId}`
- 用途：手动调整日计划内容
- 是否需要登录：是

请求参数：

| 字段            | 类型   | 必填 | 说明                                         |
| --------------- | ------ | ---- | -------------------------------------------- |
| `title`         | string | 否   | 标题                                         |
| `expectedHours` | number | 否   | 预计时长                                     |
| `notes`         | string | 否   | 备注                                         |
| `status`        | string | 否   | `draft` / `active` / `completed` / `skipped` |

响应结构：更新后的日计划对象

错误场景：

1. 未登录：`UNAUTHORIZED`
2. 日计划不存在：`NOT_FOUND`
3. `expectedHours < 0`：`INVALID_PARAMS`

## 14. Todo

### 14.1 获取 Todo 列表

- Method：`GET`
- Path：`/todo-items`
- 用途：查看 Todo 列表，可按日期、状态、科目筛选
- 是否需要登录：是

请求参数：

| 参数         | 类型   | 必填 | 说明                                   |
| ------------ | ------ | ---- | -------------------------------------- |
| `date`       | string | 否   | 查询日期；默认今天                     |
| `status`     | string | 否   | `pending` / `completed` / `cancelled`  |
| `subjectId`  | string | 否   | 科目 ID                                |
| `sourceType` | string | 否   | `manual` / `generated`                 |
| `sortBy`     | string | 否   | `due_date` / `priority` / `created_at` |
| `sortOrder`  | string | 否   | `asc` / `desc`                         |
| `page`       | number | 否   | 页码                                   |
| `pageSize`   | number | 否   | 每页条数                               |

分页与排序规则：

1. 默认排序：`due_date asc`，同日再按 `priority desc`
2. 默认分页：`20` 条

响应结构：

| 字段         | 类型   | 说明               |
| ------------ | ------ | ------------------ |
| `summary`    | object | 当日或当前筛选摘要 |
| `items`      | array  | Todo 列表          |
| `pagination` | object | 分页信息           |

错误场景：

1. 未登录：`UNAUTHORIZED`
2. 日期格式错误：`INVALID_PARAMS`
3. 状态值不支持：`INVALID_PARAMS`

### 14.2 创建 Todo

- Method：`POST`
- Path：`/todo-items`
- 用途：创建 Todo
- 是否需要登录：是

请求参数：

| 字段              | 类型   | 必填 | 说明                      |
| ----------------- | ------ | ---- | ------------------------- |
| `studyPlanId`     | string | 否   | 学习计划 ID               |
| `weeklyPlanId`    | string | 否   | 周计划 ID                 |
| `dailyPlanId`     | string | 否   | 日计划 ID                 |
| `subjectId`       | string | 否   | 科目 ID                   |
| `title`           | string | 是   | 标题                      |
| `description`     | string | 否   | 备注                      |
| `dueDate`         | string | 是   | 日期                      |
| `expectedMinutes` | number | 否   | 预计分钟数                |
| `priority`        | string | 否   | `low` / `medium` / `high` |

响应结构：

| 字段         | 类型   | 说明      |
| ------------ | ------ | --------- |
| `todoItemId` | string | Todo ID   |
| `status`     | string | `pending` |
| `sourceType` | string | `manual`  |

错误场景：

1. 未登录：`UNAUTHORIZED`
2. 标题为空：`INVALID_PARAMS`
3. 日期非法：`INVALID_PARAMS`
4. 计划与日期不匹配：`INVALID_PARAMS`

### 14.3 更新 Todo

- Method：`PATCH`
- Path：`/todo-items/{todoItemId}`
- 用途：编辑 Todo
- 是否需要登录：是

请求参数：

| 字段              | 类型           | 必填 | 说明                    |
| ----------------- | -------------- | ---- | ----------------------- |
| `title`           | string         | 否   | 标题                    |
| `description`     | string         | 否   | 备注                    |
| `dueDate`         | string         | 否   | 日期                    |
| `subjectId`       | string \| null | 否   | 科目 ID                 |
| `expectedMinutes` | number \| null | 否   | 预计分钟数              |
| `priority`        | string         | 否   | 优先级                  |
| `status`          | string         | 否   | `pending` / `cancelled` |

响应结构：更新后的 Todo 对象

错误场景：

1. 未登录：`UNAUTHORIZED`
2. Todo 不存在：`NOT_FOUND`
3. 更新参数非法：`INVALID_PARAMS`

### 14.4 完成 Todo

- Method：`POST`
- Path：`/todo-items/{todoItemId}/complete`
- 用途：标记 Todo 完成
- 是否需要登录：是

请求参数：

| 字段          | 类型   | 必填 | 说明                         |
| ------------- | ------ | ---- | ---------------------------- |
| `completedAt` | string | 否   | 完成时间，默认服务端当前时间 |

响应结构：

| 字段                | 类型   | 说明               |
| ------------------- | ------ | ------------------ |
| `todoItemId`        | string | Todo ID            |
| `status`            | string | `completed`        |
| `completedAt`       | string | 完成时间           |
| `todayPendingCount` | number | 今日剩余未完成数量 |

错误场景：

1. 未登录：`UNAUTHORIZED`
2. Todo 不存在：`NOT_FOUND`
3. 重复完成：`TODO_ALREADY_COMPLETED`

### 14.5 删除 Todo

- Method：`DELETE`
- Path：`/todo-items/{todoItemId}`
- 用途：删除 Todo
- 是否需要登录：是

请求参数：无

响应结构：`204 No Content`

错误场景：

1. 未登录：`UNAUTHORIZED`
2. Todo 不存在：`NOT_FOUND`

## 15. 打卡

### 15.1 获取今日打卡

- Method：`GET`
- Path：`/study-checkins/today`
- 用途：查看今天是否已打卡，并回填默认信息
- 是否需要登录：是

请求参数：无

响应结构：

| 字段                 | 类型           | 说明           |
| -------------------- | -------------- | -------------- |
| `checkinId`          | string \| null | 打卡 ID        |
| `checkinDate`        | string         | 打卡日期       |
| `totalStudyMinutes`  | number \| null | 今日学习分钟数 |
| `completedTodoCount` | number         | 完成 Todo 数量 |
| `primarySubjectId`   | string \| null | 主攻科目       |
| `primarySubjectName` | string \| null | 主攻科目名称   |
| `reflection`         | string \| null | 复盘备注       |
| `moodTag`            | string \| null | 心态标签       |
| `isCheckedIn`        | boolean        | 是否已打卡     |

错误场景：

1. 未登录：`UNAUTHORIZED`

### 15.2 创建打卡

- Method：`POST`
- Path：`/study-checkins`
- 用途：创建当天打卡记录
- 是否需要登录：是

请求参数：

| 字段                | 类型   | 必填 | 说明                         |
| ------------------- | ------ | ---- | ---------------------------- |
| `checkinDate`       | string | 否   | 默认今天；MVP 不支持跨天补卡 |
| `totalStudyMinutes` | number | 是   | 学习总分钟数                 |
| `primarySubjectId`  | string | 否   | 主攻科目                     |
| `reflection`        | string | 否   | 复盘备注                     |
| `moodTag`           | string | 否   | 心态标签                     |

响应结构：

| 字段                | 类型   | 说明         |
| ------------------- | ------ | ------------ |
| `checkinId`         | string | 打卡 ID      |
| `checkinDate`       | string | 日期         |
| `continuousDays`    | number | 连续打卡天数 |
| `todayStudyMinutes` | number | 今日学习时长 |

错误场景：

1. 未登录：`UNAUTHORIZED`
2. 学习时长非法：`INVALID_PARAMS`
3. 今日已打卡：`CHECKIN_ALREADY_EXISTS`

### 15.3 更新打卡

- Method：`PATCH`
- Path：`/study-checkins/{checkinId}`
- 用途：编辑当日打卡记录
- 是否需要登录：是

请求参数：

| 字段                | 类型           | 必填 | 说明         |
| ------------------- | -------------- | ---- | ------------ |
| `totalStudyMinutes` | number         | 否   | 学习总分钟数 |
| `primarySubjectId`  | string \| null | 否   | 主攻科目     |
| `reflection`        | string         | 否   | 复盘备注     |
| `moodTag`           | string \| null | 否   | 心态标签     |

响应结构：更新后的打卡对象

错误场景：

1. 未登录：`UNAUTHORIZED`
2. 打卡记录不存在：`NOT_FOUND`
3. 学习时长非法：`INVALID_PARAMS`

### 15.4 获取学习统计概览

- Method：`GET`
- Path：`/study-stats/overview`
- 用途：返回首页和统计页共用的学习概览
- 是否需要登录：是

请求参数：

| 参数    | 类型   | 必填 | 说明                          |
| ------- | ------ | ---- | ----------------------------- |
| `range` | string | 否   | `today` / `week`，默认 `week` |

响应结构：

| 字段                    | 类型           | 说明                 |
| ----------------------- | -------------- | -------------------- |
| `todayStudyMinutes`     | number         | 今日学习时长         |
| `weekStudyMinutes`      | number         | 本周学习时长         |
| `continuousCheckinDays` | number         | 连续打卡天数         |
| `todoCompletionRate`    | number         | Todo 完成率          |
| `subjectDistribution`   | array          | 各科目投入分布       |
| `todayPendingTodoCount` | number         | 今日未完成 Todo 数量 |
| `currentTarget`         | object \| null | 当前目标摘要         |
| `currentPlan`           | object \| null | 当前计划摘要         |

错误场景：

1. 未登录：`UNAUTHORIZED`
2. `range` 不支持：`INVALID_PARAMS`

## 16. 资料推荐

### 16.1 获取资料推荐列表

- Method：`GET`
- Path：`/study-resources`
- 用途：获取资料列表，支持按类型、科目、阶段筛选
- 是否需要登录：否

请求参数：

| 参数            | 类型    | 必填 | 说明                                                            |
| --------------- | ------- | ---- | --------------------------------------------------------------- |
| `resourceType`  | string  | 否   | `course` / `book` / `past_exam` / `public_resource` / `article` |
| `subjectId`     | string  | 否   | 科目 ID                                                         |
| `stageTag`      | string  | 否   | `foundation` / `intensive` / `final` / `interview`              |
| `isPublicLegal` | boolean | 否   | 是否仅看公开合法资源                                            |
| `sortBy`        | string  | 否   | `recommended` / `updated_at` / `created_at`                     |
| `sortOrder`     | string  | 否   | `asc` / `desc`                                                  |
| `page`          | number  | 否   | 页码                                                            |
| `pageSize`      | number  | 否   | 每页条数                                                        |

筛选与排序规则：

1. 默认筛选 `isPublicLegal=true`
2. 默认排序：`recommended desc`
3. 默认分页：`20` 条

响应结构：

| 字段         | 类型   | 说明     |
| ------------ | ------ | -------- |
| `items`      | array  | 资料列表 |
| `pagination` | object | 分页信息 |

`items` 列表项：

| 字段            | 类型           | 说明         |
| --------------- | -------------- | ------------ |
| `resourceId`    | string         | 资料 ID      |
| `title`         | string         | 标题         |
| `resourceType`  | string         | 类型         |
| `subjectId`     | string \| null | 科目 ID      |
| `subjectName`   | string \| null | 科目名称     |
| `stageTag`      | string         | 适用阶段     |
| `providerName`  | string \| null | 提供方       |
| `summary`       | string \| null | 简介         |
| `sourceUrl`     | string         | 来源链接     |
| `isPublicLegal` | boolean        | 是否公开合法 |
| `isFavorited`   | boolean        | 是否已收藏   |

错误场景：

1. 科目 ID 不存在：`INVALID_PARAMS`
2. 类型或阶段值非法：`INVALID_PARAMS`
3. 分页参数非法：`INVALID_PARAMS`

### 16.2 获取资料详情

- Method：`GET`
- Path：`/study-resources/{resourceId}`
- 用途：获取资料详情页内容
- 是否需要登录：否

请求参数：

| 参数         | 类型   | 说明    |
| ------------ | ------ | ------- |
| `resourceId` | string | 资料 ID |

响应结构：

| 字段            | 类型           | 说明         |
| --------------- | -------------- | ------------ |
| `resourceId`    | string         | 资料 ID      |
| `title`         | string         | 标题         |
| `resourceType`  | string         | 类型         |
| `subjectId`     | string \| null | 科目 ID      |
| `subjectName`   | string \| null | 科目名       |
| `stageTag`      | string         | 适用阶段     |
| `providerName`  | string \| null | 提供方       |
| `summary`       | string \| null | 简介         |
| `usageAdvice`   | string \| null | 使用建议     |
| `sourceUrl`     | string         | 来源链接     |
| `isPublicLegal` | boolean        | 是否公开合法 |
| `isFavorited`   | boolean        | 是否已收藏   |

错误场景：

1. `resourceId` 不存在：`NOT_FOUND`
2. 资料已下线：`NOT_FOUND`

## 17. 提醒中心

### 17.1 获取提醒列表

- Method：`GET`
- Path：`/reminders`
- 用途：获取提醒中心列表，包括系统默认提醒与用户自定义提醒
- 是否需要登录：是

请求参数：

| 参数           | 类型    | 必填 | 说明                                      |
| -------------- | ------- | ---- | ----------------------------------------- |
| `reminderType` | string  | 否   | `study` / `todo` / `exam_node` / `system` |
| `isEnabled`    | boolean | 否   | 是否启用                                  |
| `dateFrom`     | string  | 否   | 开始时间                                  |
| `dateTo`       | string  | 否   | 结束时间                                  |
| `sortBy`       | string  | 否   | `remind_at` / `created_at`                |
| `sortOrder`    | string  | 否   | `asc` / `desc`                            |
| `page`         | number  | 否   | 页码                                      |
| `pageSize`     | number  | 否   | 每页条数                                  |

分页与排序规则：

1. 默认排序：`remind_at asc`
2. 默认分页：`20` 条

响应结构：

| 字段         | 类型   | 说明     |
| ------------ | ------ | -------- |
| `items`      | array  | 提醒列表 |
| `pagination` | object | 分页信息 |

`items` 列表项：

| 字段                | 类型           | 说明         |
| ------------------- | -------------- | ------------ |
| `reminderId`        | string         | 提醒 ID      |
| `reminderType`      | string         | 类型         |
| `title`             | string         | 标题         |
| `content`           | string         | 内容         |
| `remindAt`          | string         | 提醒时间     |
| `isEnabled`         | boolean        | 是否启用     |
| `isSystemDefault`   | boolean        | 是否系统默认 |
| `relatedTargetType` | string \| null | 关联目标类型 |
| `relatedTargetId`   | string \| null | 关联目标 ID  |

错误场景：

1. 未登录：`UNAUTHORIZED`
2. 时间区间非法：`INVALID_PARAMS`
3. 类型值非法：`INVALID_PARAMS`

### 17.2 创建提醒

- Method：`POST`
- Path：`/reminders`
- 用途：创建用户自定义提醒
- 是否需要登录：是

请求参数：

| 字段                | 类型    | 必填 | 说明                                  |
| ------------------- | ------- | ---- | ------------------------------------- |
| `reminderType`      | string  | 是   | `study` / `todo`                      |
| `title`             | string  | 是   | 标题                                  |
| `content`           | string  | 是   | 内容                                  |
| `remindAt`          | string  | 是   | 提醒时间                              |
| `isEnabled`         | boolean | 否   | 是否启用，默认 `true`                 |
| `relatedTargetType` | string  | 否   | `todo` / `plan` / `program` / `other` |
| `relatedTargetId`   | string  | 否   | 关联目标 ID                           |

响应结构：

| 字段           | 类型    | 说明     |
| -------------- | ------- | -------- |
| `reminderId`   | string  | 提醒 ID  |
| `reminderType` | string  | 类型     |
| `remindAt`     | string  | 提醒时间 |
| `isEnabled`    | boolean | 是否启用 |

错误场景：

1. 未登录：`UNAUTHORIZED`
2. 标题或时间为空：`INVALID_PARAMS`
3. 提醒时间早于当前时间：`INVALID_PARAMS`
4. 同类型同时间重复提醒：`REMINDER_CONFLICT`

### 17.3 更新提醒

- Method：`PATCH`
- Path：`/reminders/{reminderId}`
- 用途：修改提醒内容或启用状态
- 是否需要登录：是

请求参数：

| 字段        | 类型    | 必填 | 说明     |
| ----------- | ------- | ---- | -------- |
| `title`     | string  | 否   | 标题     |
| `content`   | string  | 否   | 内容     |
| `remindAt`  | string  | 否   | 提醒时间 |
| `isEnabled` | boolean | 否   | 是否启用 |

响应结构：更新后的提醒对象

错误场景：

1. 未登录：`UNAUTHORIZED`
2. 提醒不存在：`NOT_FOUND`
3. 提醒时间非法：`INVALID_PARAMS`
4. 系统默认提醒不允许修改核心字段：`FORBIDDEN`

### 17.4 删除提醒

- Method：`DELETE`
- Path：`/reminders/{reminderId}`
- 用途：删除用户自定义提醒
- 是否需要登录：是

请求参数：无

响应结构：`204 No Content`

错误场景：

1. 未登录：`UNAUTHORIZED`
2. 提醒不存在：`NOT_FOUND`
3. 系统默认提醒不允许删除：`FORBIDDEN`

## 18. MVP 实现优先级建议

### P0

1. `POST /auth/otp/send`
2. `POST /auth/login/otp`
3. `GET /users/me`
4. `PUT /user-profiles/me`
5. `GET /schools`
6. `GET /schools/{schoolId}`
7. `GET /schools/{schoolId}/programs`
8. `GET /programs/{programId}`
9. `POST /favorites`
10. `GET /favorites`
11. `POST /comparison-items`
12. `GET /comparison-items/result`
13. `PUT /user-targets/current`
14. `POST /study-plans/generate`
15. `GET /study-plans/current`
16. `GET /weekly-plans`
17. `GET /daily-plans`
18. `GET /todo-items`
19. `POST /todo-items`
20. `POST /todo-items/{todoItemId}/complete`
21. `GET /study-checkins/today`
22. `POST /study-checkins`
23. `GET /study-stats/overview`
24. `GET /study-resources`
25. `GET /reminders`

### P1

1. `DELETE /favorites`
2. `DELETE /comparison-items`
3. `GET /user-targets/current`
4. `PATCH /weekly-plans/{weeklyPlanId}`
5. `PATCH /daily-plans/{dailyPlanId}`
6. `PATCH /todo-items/{todoItemId}`
7. `DELETE /todo-items/{todoItemId}`
8. `PATCH /study-checkins/{checkinId}`
9. `GET /study-resources/{resourceId}`
10. `POST /reminders`
11. `PATCH /reminders/{reminderId}`
12. `DELETE /reminders/{reminderId}`

## 19. 管理后台接口（Admin）

> 基路径：`/api/v1/admin/*`  
> 鉴权：`Authorization: Bearer <adminAccessToken>`（`mock.admin.` 前缀开发期 token）  
> 角色：`admin` 可管理 App 用户与学校；`super_admin` 另可管理后台账号。

### 19.1 登录

- `POST /admin/auth/login`：用户名 + 密码，返回 `accessToken` 与 `adminUser`
- `GET /admin/auth/me`：当前后台账号信息

### 19.2 App 用户（普通用户）

- `GET /admin/app-users`：分页列表，`keyword`、`status`
- `PATCH /admin/app-users/{userId}`：更新 `nickname`、`status`（`active` / `disabled`）

### 19.3 后台账号（仅 super_admin）

- `GET /admin/staff`：后台账号列表
- `POST /admin/staff`：新增管理员或超级管理员
- `PATCH /admin/staff/{adminUserId}`：更新 `displayName`、`password`、`role`、`status`

### 19.4 学校档案（管理员+）

- `GET /admin/schools`：运营列表，支持 `keyword`、`province`、`city`、`schoolLevel`、`schoolType`、`status`
- `GET /admin/schools/{schoolId}`：学校详情（含停用）
- `POST /admin/schools`：新建学校
- `PATCH /admin/schools/{schoolId}`：修订学校字段或 `status`（`active` / `inactive`）

公开 `GET /schools` 仍仅返回 `active` 且未软删学校；停用后前台不可见。

## 20. 待确认接口问题

以下问题建议在后端实现前由产品、客户端、后端共同确认：

1. 登录是否仅保留手机号验证码，还是预留微信等第三方登录入口。
2. 择校列表的 `recommended` 排序规则由什么组成，是人工权重、热度，还是数据完整度。
3. `study-plans/generate` 是否一并生成首批 `todo_items`，还是只生成计划骨架。
4. 周计划与日计划的手动编辑范围是否允许修改日期，仅允许修改标题/时长/备注。
5. 打卡是否允许补卡，当前文档按“仅当天可打卡”设计。
6. 资料推荐是否需要“评分和标签”字段，`project-plan.md` 提到该能力，但数据库设计尚未建模。
7. 首页所需“倒计时、今日摘要、当前目标、推荐资料”是否由现有多个接口聚合，还是后续补一个首页聚合接口。
