import { ModulePlaceholder } from "@/components/module-placeholder";

export default function ResourcesPage() {
  return (
    <ModulePlaceholder
      title="资料推荐管理"
      description="这页在本轮明确保持预留态，只保留学习资料推荐模块的挂接位置，不计入当前后台交付范围。"
      scope={["资料标题与类型", "科目关联", "阶段标签", "公开合法资源标记"]}
      relatedTables={["study_resources", "subjects"]}
      nextSteps={["资料列表", "资料创建表单", "阶段标签筛选", "资源状态管理"]}
    />
  );
}
