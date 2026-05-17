import { ModulePlaceholder } from "@/components/module-placeholder";

export default function SourceLinksPage() {
  return (
    <ModulePlaceholder
      title="来源链接管理"
      description="用于承接官方来源链接和校验状态维护，确保前台关键择校数据具备可追溯的来源入口。"
      scope={["来源标题与链接", "来源类型", "发布时间", "最后校验时间与状态"]}
      relatedTables={["program_source_links", "programs"]}
      nextSteps={["来源列表", "失效状态标记", "按年份筛选", "按专业关联查询"]}
    />
  );
}
