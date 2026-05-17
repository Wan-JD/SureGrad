import { ModulePlaceholder } from "@/components/module-placeholder";

export default function ResourcesPage() {
  return (
    <ModulePlaceholder
      title="资料推荐管理"
      description="预留学习资料推荐的后台录入入口，后续可逐步接入科目、阶段标签、来源链接和合法性标记。"
      scope={["资料标题与类型", "科目关联", "阶段标签", "公开合法资源标记"]}
      relatedTables={["study_resources", "subjects"]}
      nextSteps={["资料列表", "资料创建表单", "阶段标签筛选", "资源状态管理"]}
    />
  );
}
