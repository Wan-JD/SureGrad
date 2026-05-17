import { ModulePlaceholder } from "@/components/module-placeholder";

export default function SchoolsPage() {
  return (
    <ModulePlaceholder
      title="学校管理"
      description="围绕学校基础信息搭建后台入口，后续可承接学校列表、状态筛选、官网维护和排序管理。"
      scope={["学校基础信息录入", "学校状态管理", "官网与描述维护", "排序与运营展示字段"]}
      relatedTables={["schools"]}
      nextSteps={["学校列表页", "学校编辑表单", "状态筛选", "基础搜索"]}
    />
  );
}
