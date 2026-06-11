# 官方学校官网补全批次（2026-06-08）

采集日期：`2026-06-08`

## 范围

本批次从 2026-06-08 本地原始材料中筛出已能按标准 `schools.csv` 入库的学校官网、研究生院或研究生招生官网、学校类型与 `has_graduate_school=true` 字段，共 31 所重点高校。

该批次只补学校基础字段，不导入原始材料批次中的专业来源链接、分数线、考试科目或参考书信息。

## 学校清单

| 学校 | 官方主页 | 研究生入口 |
| --- | --- | --- |
| 北京大学 | <https://www.pku.edu.cn> | <https://admission.pku.edu.cn> |
| 清华大学 | <https://www.tsinghua.edu.cn> | <https://yz.tsinghua.edu.cn> |
| 北京师范大学 | <https://www.bnu.edu.cn> | <https://yz.bnu.edu.cn> |
| 北京航空航天大学 | <https://www.buaa.edu.cn> | <https://yzb.buaa.edu.cn> |
| 北京理工大学 | <https://www.bit.edu.cn> | <https://grd.bit.edu.cn> |
| 中国农业大学 | <https://www.cau.edu.cn> | <https://yz.cau.edu.cn> |
| 北京邮电大学 | <https://www.bupt.edu.cn> | <https://yzb.bupt.edu.cn> |
| 南开大学 | <https://www.nankai.edu.cn> | <https://yzb.nankai.edu.cn> |
| 天津大学 | <https://www.tju.edu.cn> | <https://yzb.tju.edu.cn> |
| 大连理工大学 | <https://www.dlut.edu.cn> | <https://gs.dlut.edu.cn> |
| 吉林大学 | <https://www.jlu.edu.cn> | <https://gra.jlu.edu.cn> |
| 哈尔滨工业大学 | <https://www.hit.edu.cn> | <https://yzb.hit.edu.cn> |
| 复旦大学 | <https://www.fudan.edu.cn> | <https://gsao.fudan.edu.cn> |
| 同济大学 | <https://www.tongji.edu.cn> | <https://yz.tongji.edu.cn> |
| 上海交通大学 | <https://www.sjtu.edu.cn> | <https://yzb.sjtu.edu.cn> |
| 华东师范大学 | <https://www.ecnu.edu.cn> | <https://yjszs.ecnu.edu.cn> |
| 南京大学 | <https://www.nju.edu.cn> | <https://yzb.nju.edu.cn> |
| 东南大学 | <https://www.seu.edu.cn> | <https://yzb.seu.edu.cn> |
| 中国科学技术大学 | <https://www.ustc.edu.cn> | <https://yz.ustc.edu.cn> |
| 厦门大学 | <https://www.xmu.edu.cn> | <https://zs.xmu.edu.cn> |
| 山东大学 | <https://www.sdu.edu.cn> | <https://www.yz.sdu.edu.cn> |
| 武汉大学 | <https://www.whu.edu.cn> | <https://gs.whu.edu.cn> |
| 华中科技大学 | <https://www.hust.edu.cn> | <https://gszs.hust.edu.cn> |
| 湖南大学 | <https://www.hnu.edu.cn> | <https://gra.hnu.edu.cn> |
| 中南大学 | <https://www.csu.edu.cn> | <https://yz.csu.edu.cn> |
| 中山大学 | <https://www.sysu.edu.cn> | <https://gra.sysu.edu.cn> |
| 四川大学 | <https://www.scu.edu.cn> | <https://yz.scu.edu.cn> |
| 电子科技大学 | <https://www.uestc.edu.cn> | <https://yz.uestc.edu.cn> |
| 西安交通大学 | <https://www.xjtu.edu.cn> | <https://yz.xjtu.edu.cn> |
| 西北工业大学 | <https://www.nwpu.edu.cn> | <https://yzb.nwpu.edu.cn> |
| 西安电子科技大学 | <https://www.xidian.edu.cn> | <https://yz.xidian.edu.cn> |

## 口径

- `code`、`province`、`city`、`school_level`、`sort_order` 对齐教育部 2025 全国普通高等学校名单。
- `official_website` 与 `graduate_website` 仅使用学校官方域名或学校研究生招生官方域名。
- `school_type` 为产品筛选用人工分类，不来自教育部 2025 名单。
- 不采集、不导入分数线、招生计划、报录比、参考书、考试大纲等年度专业数据；这些字段须在后续专业批次中逐条清洗、补齐 `programs.csv` 闭环并复核后再入库。
- 2026-06-08 本地原始材料中仍有未结构化专业来源和 `estimated` 分数线，当前只作为待清洗材料，不接入 `pnpm db:seed:collected`。

## 本地校验

```powershell
python tools/data-import/validate_csv.py tools/data-import/collected/official-school-websites-2026-06-08
powershell -ExecutionPolicy Bypass -File tools/data-import/run_import.ps1 -ConfigPath tools/data-import/config.import-official-school-websites-2026-06-08.yaml
```
