# 教育部全国普通高等学校名单 2025 基础学校批次

采集日期：`2026-06-07`
官方发布日期：`2025-06-27`
官方统计口径：截至 `2025-06-20`

## 采集范围

本批次只采集 `schools.csv`，共 2919 所普通高等学校基础条目。

官方页面口径为：全国普通高等学校 2919 所，其中本科学校 1365 所、高职（专科）学校 1554 所。本批次生成结果与该口径一致：

| 办学层次 | 行数 |
|----------|------|
| 本科 | 1365 |
| 专科 | 1554 |
| 合计 | 2919 |

字段来源：

1. `name`：教育部附件中的学校名称。
2. `code`：教育部附件中的学校标识码。
3. `city`：教育部附件中的所在地。
4. `school_level`：教育部附件中的办学层次。
5. `description`：保留主管部门、办学层次和备注，便于后续复核。

## 官方来源

1. 教育部公告《全国高等学校名单》：https://www.moe.gov.cn/jyb_xxgk/s5743/s5744/202506/t20250627_1195683.html
2. 官方附件《全国普通高等学校名单》：https://www.moe.gov.cn/jyb_xxgk/s5743/s5744/202506/W020250729615142156867.xls

## 人工说明

1. 本批次不采集分数线、招生计划、报录比、专业目录等考研年度数据。
2. `school_type=未分类`、`has_graduate_school=false` 为系统字段占位，不作为教育部名单事实；待逐校官网核验后再更新。
3. 官网与研究生院链接先留空，避免用非官方或未核验链接补充。
4. `province` 来自附件中的省级小节标题，用于后台筛选；不是附件单独字段。
5. `short_name` 暂与学校全名一致，待逐校官网核验简称后再更新。
6. `pnpm db:seed:collected` 会先导入本批次，再导入 5 校精采批次，用已逐校核验的官网、研究生院链接和学校类型覆盖本批次占位值。

## 本地校验

如需从教育部官方 Excel 附件重新生成本批次：

```powershell
python tools/data-import/scripts/parse_moe_universities_2025.py --input output/moe-universities-2025.xls
```

该脚本会校验总数 `2919`、本科 `1365`、专科 `1554`、省级小节计数、学校标识码唯一性和 `name + city` 唯一性。

```powershell
python tools/data-import/validate_csv.py tools/data-import/collected/moe-universities-2025
```

当前结果：`schools.csv rows=2919 errors=0 warnings=0`。
