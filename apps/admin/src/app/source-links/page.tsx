import { OperationsWorkspace } from "@/components/operations-workspace";
import { getAdminOperationsPage } from "@/lib/admin-operations";
import { buildDynamicFilters, getCollectedSourceLinkRecords } from "@/lib/collected-import-batches";

export default async function SourceLinksPage() {
  const page = getAdminOperationsPage("source-links");
  const dataset = page.datasets[0];
  const records = await getCollectedSourceLinkRecords();

  return (
    <OperationsWorkspace
      page={{
        ...page,
        description:
          "优先展示 tools/data-import/collected 里已经人工核验过的真实来源链接，方便运营直接核对批次覆盖、年份和复核时间。",
        datasets: [
          {
            ...dataset,
            description:
              "当前列表来自已采集真实批次，而不是演示 mock。空缺年份或来源类型，意味着我们还没有把对应官方链接整理进仓库。",
            filters: buildDynamicFilters(dataset, records, ["status", "source_type", "exam_year"]),
            records,
          },
        ],
      }}
    />
  );
}
