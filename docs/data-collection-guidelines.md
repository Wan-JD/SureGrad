# SureGrad 数据收集规范和流程

**版本**：v1.0
**创建日期**：2026-06-07
**维护者**：SureGrad数据团队

## 1. 数据收集原则

### 1.1 核心原则

**真实性原则**：
- ✅ 所有数据必须来自官方渠道
- ✅ 所有数据经人工复核验证
- ❌ 禁止编造或估计数据
- ❌ 禁止使用非官方来源

**可追溯性原则**：
- ✅ 每条数据必须有来源URL
- ✅ 标注数据采集日期
- ✅ 标注数据验证状态
- ✅ 保留原始数据快照

**准确性原则**：
- ✅ 数字必须精确
- ✅ 文字必须准确
- ✅ 格式必须统一
- ✅ 无歧义表达

### 1.2 禁止事项

❌ **绝对禁止**：
1. 编造数字或数据
2. 使用估计数据而未标注
3. 使用非官方来源
4. 导入未验证数据
5. 复制粘贴错误数据

⚠️ **需要谨慎**：
1. 使用历史数据（需标注年份）
2. 使用第三方数据（需验证准确性）
3. 使用推测性数据（需明确标注）

## 2. 官方数据来源

### 2.1 国家级官方来源

| 来源 | 网址 | 权威性 | 数据类型 |
|------|------|--------|----------|
| 中国研究生招生信息网 | https://yz.chsi.com.cn/ | 最高 | 国家线、调剂信息 |
| 教育部官网 | http://www.moe.gov.cn/ | 最高 | 政策、统计数据 |
| 学位与研究生教育信息网 | https://www.cdgdc.edu.cn/ | 高 | 学科评估、学位点 |

### 2.2 学校级官方来源

| 来源 | 网址格式 | 权威性 | 数据类型 |
|------|----------|--------|----------|
| 学校研究生院 | https://gschool.{school}.edu.cn/ | 高 | 复试线、招生简章 |
| 学校招生办公室 | https://yz.{school}.edu.cn/ | 高 | 招生计划、专业目录 |
| 学院官网 | https://www.{college}.{school}.edu.cn/ | 中 | 复试细则、参考书 |

### 2.3 权威性等级

**A级（最高权威）**：
- 教育部官方发布
- 研招网首发数据
- 学校研究生院官方公告

**B级（高权威）**：
- 学校招生办公室公告
- 学院官方公告
- 官方新闻发布会

**C级（中等权威）**：
- 官方媒体报道
- 学校官方公众号
- 权威教育媒体

**D级（低权威）- 不建议使用**：
- 社交媒体
- 非官方论坛
- 个人博客
- 经验分享帖

## 3. 数据验证流程

### 3.1 验证步骤

```
1. 数据收集
   ↓
2. 来源验证（检查URL有效性）
   ↓
3. 人工复核（核对数字和文字）
   ↓
4. 交叉验证（多个来源确认）
   ↓
5. 格式验证（符合schema）
   ↓
6. 标记验证状态
   ↓
7. 导入数据库
```

### 3.2 验证状态标记

| 状态 | 标记 | 说明 | 可导入 |
|------|------|------|--------|
| 已验证 | `verified` | 经人工复核，来源可靠 | ✅ 是 |
| 待验证 | `pending` | 已收集，待人工复核 | ⚠️ 暂缓 |
| 待确认 | `unconfirmed` | 来源不够权威 | ❌ 否 |
| 已验证有误 | `verified_incorrect` | 经复核发现错误 | ❌ 否 |

### 3.3 人工复核清单

**数字类数据复核**：
- [ ] 总分是否正确
- [ ] 单科分数是否正确
- [ ] 计算是否正确
- [ ] 与往年对比是否合理

**文字类数据复核**：
- [ ] 专业名称是否准确
- [ ] 专业代码是否正确
- [ ] 学校名称是否准确
- [ ] 学院名称是否准确

**来源类数据复核**：
- [ ] URL是否可访问
- [ ] 来源是否为官方
- [ ] 采集日期是否标注
- [ ] 验证状态是否标记

## 4. 数据采集模板

### 4.1 国家线采集模板

```csv
record_id,exam_year,discipline_category,degree_type,region,category,total_score,politics_score,english_score,specialty_score_1,specialty_score_2,source_type,source_url,collection_date,verification_status,verifier,verification_date
```

**字段说明**：
- `record_id`: 唯一标识符（UUID格式）
- `exam_year`: 考试年份
- `discipline_category`: 学科门类（工学、理学、经济学等）
- `degree_type`: 学位类型（academic/professional）
- `region`: 地区（一区/二区）
- `category`: 类别（A类/B类）
- `total_score`: 总分
- `*_score`: 各科目分数
- `source_type`: 来源类型（official/estimated/unverified）
- `source_url`: 数据来源URL
- `collection_date`: 采集日期
- `verification_status`: 验证状态
- `verifier`: 验证人
- `verification_date`: 验证日期

### 4.2 学校复试线采集模板

```csv
record_id,school_id,school_name,program_id,program_name,exam_year,retest_score_line,politics_line,english_line,specialty_line_1,specialty_line_2,source_type,source_url,collection_date,verification_status,verifier,verification_date
```

### 4.3 招生计划采集模板

```csv
record_id,school_id,program_id,exam_year,planned_admissions,recommended_admissions,unified_exam_admissions,source_type,source_url,collection_date,verification_status
```

## 5. 数据导入规范

### 5.1 导入前检查清单

- [ ] 所有数据已验证（verification_status = verified）
- [ ] 所有数据有来源URL（source_url不为空）
- [ ] 所有数据格式符合schema
- [ ] 无重复数据
- [ ] 无矛盾数据
- [ ] 无编造数据

### 5.2 导入流程

```bash
# 1. 验证数据
python tools/data-import/validate_data.py collected/batch-name/

# 2. 生成导入脚本
python tools/data-import/generate_import.py collected/batch-name/

# 3. 执行导入
pnpm db:seed:collected

# 4. 验证导入结果
curl http://localhost:3000/api/v1/schools | jq .
```

### 5.3 导入后验证

- [ ] 数据完整性检查
- [ ] 数据准确性检查
- [ ] API响应正常
- [ ] 前端展示正常

## 6. 数据质量指标

### 6.1 质量维度

| 维度 | 指标 | 目标值 |
|------|------|--------|
| 完整性 | 必需字段填充率 | ≥95% |
| 准确性 | 数字错误率 | ≤1% |
| 一致性 | 格式统一率 | ≥99% |
| 及时性 | 数据更新延迟 | ≤7天 |
| 可追溯性 | 来源URL覆盖率 | 100% |

### 6.2 质量检查频率

- **每次导入前**：完整性、准确性检查
- **每周**：一致性、可追溯性检查
- **每月**：全面质量审计

## 7. 异常处理

### 7.1 数据异常

| 异常类型 | 处理方式 |
|----------|----------|
| 数字明显错误 | 标记为verified_incorrect，不导入 |
| 来源不可靠 | 标记为unconfirmed，不导入 |
| 格式不符合 | 修正后重新验证 |
| 数据缺失 | 标记为pending，补充后导入 |

### 7.2 来源异常

| 异常类型 | 处理方式 |
|----------|----------|
| URL不可访问 | 标记为unverified，寻找替代来源 |
| 来源变更 | 更新URL，重新验证 |
| 来源删除 | 标记为unconfirmed，寻找存档 |

## 8. 文档和记录

### 8.1 必需文档

1. **采集批次README**：说明采集范围、来源、时间
2. **数据验证报告**：记录验证过程和结果
3. **导入日志**：记录导入时间和结果
4. **质量报告**：定期质量检查结果

### 8.2 记录保存

- 原始数据：保存在 `collected/` 目录
- 验证报告：保存在 `docs/data-quality/` 目录
- 导入日志：保存在 `logs/` 目录
- 质量报告：保存在 `docs/data-quality/` 目录

## 9. 联系方式

如发现数据错误或有疑问，请联系：
- **数据维护团队**：[待填写]
- **问题反馈**：[待填写]
- **紧急联系**：[待填写]

## 10. 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| v1.0 | 2026-06-07 | 创建初始版本 |

EOF

echo "✓ 数据收集规范文档创建完成"