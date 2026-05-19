import { OperationsWorkspace } from "@/components/operations-workspace";
import { getAdminOperationsPage } from "@/lib/admin-operations";
import { buildDynamicFilters, getCollectedYearlyDatasetRecords } from "@/lib/collected-import-batches";

export default async function YearlyDataPage() {
  const page = getAdminOperationsPage("yearly-data");
  const yearlyRecords = await getCollectedYearlyDatasetRecords();

  return (
    <OperationsWorkspace
      page={{
        ...page,
        description:
          "年份数据页现在优先反映仓库里真实已采集的年度表。当前有数据的页签代表已核验入批次，空页签则直接暴露采集缺口。",
        datasets: page.datasets.map((dataset) => {
          const records = yearlyRecords[dataset.tableName] ?? [];

          return {
            ...dataset,
            description:
              dataset.tableName === "program_score_lines"
                ? "当前页签展示已采集真实批次中的分数线数据。"
                : "当前页签暂未录入真实批次，后续采集完成后会直接在这里出现。",
            filters: buildDynamicFilters(dataset, records, ["exam_year", "source_confidence"]),
            records,
          };
        }),
      }}
    />
  );
}
