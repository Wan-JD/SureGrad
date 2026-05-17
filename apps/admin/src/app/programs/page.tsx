import { ModulePlaceholder } from "@/components/module-placeholder";

export default function ProgramsPage() {
  return (
    <ModulePlaceholder
      title="专业管理"
      description="对应 SureGrad MVP 的核心招生专业实体，后续可在这里承接专业录入、学位类型维护和研究方向管理。"
      scope={["专业基础信息", "院系与学校归属", "学位类型维护", "研究方向字段维护"]}
      relatedTables={["programs", "departments", "schools"]}
      nextSteps={["专业列表", "专业表单", "研究方向录入", "专业状态管理"]}
    />
  );
}
