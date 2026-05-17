import { ModulePlaceholder } from "@/components/module-placeholder";

export default function YearlyDataPage() {
  return (
    <ModulePlaceholder
      title="年份数据管理"
      description="聚焦年份维度的招生与竞争数据，当前先作为统一入口，后续可再细分分数线、报录比、复录比和招生计划。"
      scope={["按专业查看年份数据", "分数线录入", "报录比维护", "复录比与招生计划维护"]}
      relatedTables={[
        "program_admissions",
        "program_score_lines",
        "program_application_stats",
        "program_interview_stats",
      ]}
      nextSteps={["年份数据总览", "分年份编辑表单", "来源可信度字段", "按专业联动筛选"]}
    />
  );
}
