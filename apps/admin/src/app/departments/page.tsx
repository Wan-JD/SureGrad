import { OperationsWorkspace } from "@/components/operations-workspace";
import { getAdminOperationsPage } from "@/lib/admin-operations";
import { buildDynamicFilters, getCollectedDepartmentRecords } from "@/lib/collected-import-batches";

export default async function DepartmentsPage() {
  const page = getAdminOperationsPage("departments");
  const dataset = page.datasets[0];
  const records = await getCollectedDepartmentRecords();

  return (
    <OperationsWorkspace
      page={{
        ...page,
        description:
          "优先展示 tools/data-import/collected 里已采集的真实院系数据，便于运营在学校链路下核对院系归属与官网入口。",
        datasets: [
          {
            ...dataset,
            description:
              "当前列表来自已采集真实批次。列表中的 school_id 列展示学校名称，便于运营阅读；入库后 API 侧仍使用 UUID。",
            filters: buildDynamicFilters(dataset, records, ["status", "school_id"]),
            records,
          },
        ],
      }}
    />
  );
}
