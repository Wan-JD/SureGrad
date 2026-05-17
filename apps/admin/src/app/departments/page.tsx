import { ModulePlaceholder } from "@/components/module-placeholder";

export default function DepartmentsPage() {
  return (
    <ModulePlaceholder
      title="院系管理"
      description="围绕学校与院系的从属关系预留管理入口，方便后续继续完成院系录入、挂接学校与院系官网维护。"
      scope={["院系列表", "按学校筛选院系", "院系官网维护", "院系状态控制"]}
      relatedTables={["departments", "schools"]}
      nextSteps={["学校维度筛选", "院系新建页", "院系编辑页", "所属学校联动选择"]}
    />
  );
}
