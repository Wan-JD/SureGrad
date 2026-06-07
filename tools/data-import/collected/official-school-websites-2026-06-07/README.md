# 官方学校官网补全批次（2026-06-07）

采集日期：`2026-06-07`

## 范围

本批次补充 8 所学校的官网、研究生院或研究生招生官网、学校类型与 `has_graduate_school=true`：

1. 北京大学
2. 清华大学
3. 北京航空航天大学
4. 北京理工大学
5. 中国农业大学
6. 北京师范大学
7. 南开大学
8. 大连理工大学

## 官方来源

| 学校             | 官方主页                      | 研究生入口                     |
| ---------------- | ----------------------------- | ------------------------------ |
| 北京大学         | <https://www.pku.edu.cn>      | <https://admission.pku.edu.cn> |
| 清华大学         | <https://www.tsinghua.edu.cn> | <https://yz.tsinghua.edu.cn>   |
| 北京航空航天大学 | <https://www.buaa.edu.cn>     | <https://yzb.buaa.edu.cn>      |
| 北京理工大学     | <https://www.bit.edu.cn>      | <https://grd.bit.edu.cn>       |
| 中国农业大学     | <https://www.cau.edu.cn>      | <https://yz.cau.edu.cn>        |
| 北京师范大学     | <https://www.bnu.edu.cn>      | <https://yz.bnu.edu.cn>        |
| 南开大学         | <https://www.nankai.edu.cn>   | <https://yzb.nankai.edu.cn>    |
| 大连理工大学     | <https://www.dlut.edu.cn>     | <https://gs.dlut.edu.cn>       |

## 口径

- `code`、`province`、`city`、`school_level`、`sort_order` 沿用教育部 2025 全国普通高等学校名单。
- `official_website` 和 `graduate_website` 仅使用学校官方域名或学校研究生招生官方域名。
- `school_type` 为面向产品筛选的人工分类，不来自教育部 2025 名单。
- 不采集分数线、招生计划、报录比、参考书等年度数据；这些字段须在后续专业批次中另行逐条核验。

## 本地校验

```powershell
python tools/data-import/validate_csv.py tools/data-import/collected/official-school-websites-2026-06-07
```
