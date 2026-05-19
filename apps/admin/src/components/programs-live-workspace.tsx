"use client";

import { useEffect, useMemo, useState } from "react";
import { LiveOperationsWorkspace, type FilterControl } from "@/components/live-operations-workspace";
import { getAdminOperationsPage } from "@/lib/admin-operations";
import {
  filterRecordsBySearch,
  listSchoolPrograms,
  listSchools,
  mapProgramListItemToRecord,
  programsLiveColumns,
  programsLiveDetailSections,
  programsLiveFields,
  toSelectOptions,
  type SchoolListItem,
  type SchoolProgramListItem,
} from "@/lib/admin-live-data";

const page = getAdminOperationsPage("programs");
const scaffoldDataset = page.datasets[0];

type ProgramQueryState = {
  schoolId: string;
  degreeType: string;
  disciplineCategory: string;
  examMathRequired: string;
  search: string;
};

type ListState = {
  rawItems: SchoolProgramListItem[];
  records: ReturnType<typeof mapProgramListItemToRecord>[];
  total: number;
  loading: boolean;
  error: string | null;
};

function buildOptionList(allLabel: string, values: string[]) {
  return [{ label: allLabel, value: "" }, ...values.map((value) => ({ label: value, value }))];
}

export function ProgramsLiveWorkspace() {
  const [schools, setSchools] = useState<SchoolListItem[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [schoolsError, setSchoolsError] = useState<string | null>(null);
  const [query, setQuery] = useState<ProgramQueryState>({
    schoolId: "",
    degreeType: "",
    disciplineCategory: "",
    examMathRequired: "",
    search: "",
  });
  const [selectedId, setSelectedId] = useState("");
  const [listState, setListState] = useState<ListState>({
    rawItems: [],
    records: [],
    total: 0,
    loading: false,
    error: null,
  });
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    setSchoolsLoading(true);
    setSchoolsError(null);

    void listSchools({ page: 1, pageSize: 50 }, controller.signal)
      .then((response) => {
        setSchools(response.items);
        setSchoolsLoading(false);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setSchools([]);
        setSchoolsLoading(false);
        setSchoolsError(error instanceof Error ? error.message : "Failed to load schools.");
      });

    return () => controller.abort();
  }, [reloadToken]);

  useEffect(() => {
    if (!schools.length) {
      return;
    }

    const stillExists = schools.some((school) => school.schoolId === query.schoolId);
    if (!stillExists) {
      setQuery((current) => ({
        ...current,
        schoolId: schools[0].schoolId,
      }));
    }
  }, [query.schoolId, schools]);

  useEffect(() => {
    if (!query.schoolId) {
      setListState({
        rawItems: [],
        records: [],
        total: 0,
        loading: false,
        error: null,
      });
      return;
    }

    const controller = new AbortController();
    const selectedSchoolName =
      schools.find((school) => school.schoolId === query.schoolId)?.schoolName ?? "Selected school";

    setListState((current) => ({
      ...current,
      loading: true,
      error: null,
    }));

    void listSchoolPrograms(
      query.schoolId,
      {
        degreeType: query.degreeType,
        disciplineCategory: query.disciplineCategory,
        examMathRequired:
          query.examMathRequired === ""
            ? undefined
            : query.examMathRequired === "true",
        page: 1,
        pageSize: 50,
      },
      controller.signal,
    )
      .then((response) => {
        setListState({
          rawItems: response.items,
          records: response.items.map((item) =>
            mapProgramListItemToRecord(item, selectedSchoolName),
          ),
          total: response.pagination.total,
          loading: false,
          error: null,
        });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setListState({
          rawItems: [],
          records: [],
          total: 0,
          loading: false,
          error: error instanceof Error ? error.message : "Failed to load programs.",
        });
      });

    return () => controller.abort();
  }, [
    query.degreeType,
    query.disciplineCategory,
    query.examMathRequired,
    query.schoolId,
    reloadToken,
    schools,
  ]);

  const filteredRecords = useMemo(
    () => filterRecordsBySearch(listState.records, query.search),
    [listState.records, query.search],
  );

  useEffect(() => {
    if (!filteredRecords.length) {
      setSelectedId("");
      return;
    }

    const hasSelected = filteredRecords.some((record) => String(record.id) === selectedId);
    if (!hasSelected) {
      setSelectedId(String(filteredRecords[0].id));
    }
  }, [filteredRecords, selectedId]);

  const selectedSchoolName =
    schools.find((school) => school.schoolId === query.schoolId)?.schoolName ?? "当前院校";

  const schoolOptions = useMemo(
    () => [
      { label: "请选择学校", value: "" },
      ...schools.map((school) => ({
        label: school.schoolName,
        value: school.schoolId,
      })),
    ],
    [schools],
  );

  const degreeOptions = useMemo(
    () => buildOptionList("全部学位类型", toSelectOptions(listState.rawItems.map((item) => item.degreeType))),
    [listState.rawItems],
  );

  const disciplineOptions = useMemo(
    () =>
      buildOptionList(
        "全部学科门类",
        toSelectOptions(listState.rawItems.map((item) => item.disciplineCategory)),
      ),
    [listState.rawItems],
  );

  const examMathOptions = useMemo(
    () => [
      { label: "全部数学要求", value: "" },
      { label: "要求考数学", value: "true" },
      { label: "不要求考数学", value: "false" },
    ],
    [],
  );

  const filters = useMemo<FilterControl[]>(
    () => [
      {
        key: "schoolId",
        label: "学校",
        value: query.schoolId,
        options: schoolOptions,
        onChange: (value) =>
          setQuery((current) => ({
            ...current,
            schoolId: value,
            degreeType: "",
            disciplineCategory: "",
            examMathRequired: "",
            search: "",
          })),
        disabled: schoolsLoading,
      },
      {
        key: "degreeType",
        label: "学位",
        value: query.degreeType,
        options: degreeOptions,
        onChange: (value) => setQuery((current) => ({ ...current, degreeType: value })),
        disabled: !query.schoolId || listState.loading,
      },
      {
        key: "disciplineCategory",
        label: "学科",
        value: query.disciplineCategory,
        options: disciplineOptions,
        onChange: (value) => setQuery((current) => ({ ...current, disciplineCategory: value })),
        disabled: !query.schoolId || listState.loading,
      },
      {
        key: "examMathRequired",
        label: "数学要求",
        value: query.examMathRequired,
        options: examMathOptions,
        onChange: (value) => setQuery((current) => ({ ...current, examMathRequired: value })),
        disabled: !query.schoolId || listState.loading,
      },
    ],
    [
      degreeOptions,
      disciplineOptions,
      examMathOptions,
      listState.loading,
      query.degreeType,
      query.disciplineCategory,
      query.examMathRequired,
      query.schoolId,
      schoolOptions,
      schoolsLoading,
    ],
  );

  const listError = schoolsError ?? listState.error;
  const listLoading = schoolsLoading || listState.loading;
  const detailRecord =
    filteredRecords.find((record) => String(record.id) === selectedId) ?? null;

  return (
    <LiveOperationsWorkspace
      page={page}
      dataset={{
        title: scaffoldDataset.title,
        description: scaffoldDataset.description,
        tableName: scaffoldDataset.tableName,
        templateName: scaffoldDataset.templateName,
        importActions: scaffoldDataset.importActions,
        revisionActions: scaffoldDataset.revisionActions,
        columns: programsLiveColumns,
        fields: programsLiveFields,
        detailSections: programsLiveDetailSections,
      }}
      search={{
        value: query.search,
        placeholder: "在当前学校结果内搜索专业",
        onChange: (value) => setQuery((current) => ({ ...current, search: value })),
        disabled: !query.schoolId || listLoading,
        helpText: query.schoolId
          ? `当前只会在 ${selectedSchoolName} 的已加载专业列表内搜索。`
          : "请先选择学校，再在该校专业列表内搜索。",
      }}
      filters={filters}
      records={filteredRecords}
      totalRecords={listState.total}
      selectedId={selectedId}
      onSelect={setSelectedId}
      onResetFilters={() =>
        setQuery((current) => ({
          schoolId: current.schoolId,
          degreeType: "",
          disciplineCategory: "",
          examMathRequired: "",
          search: "",
        }))
      }
      listLoading={listLoading}
      listError={listError}
      listLoadingCopy={
        schoolsLoading
          ? "正在从后端加载学校选项。"
          : "正在加载该校专业列表。"
      }
      listEmptyCopy={
        query.schoolId
          ? query.search
            ? "当前搜索条件下没有匹配的专业。"
            : "这所学校在当前筛选条件下没有返回专业数据。"
          : "请先选择学校，再加载专业数据。"
      }
      onRetryList={() => setReloadToken((value) => value + 1)}
      detailRecord={detailRecord}
      detailLoading={false}
      detailLoadingCopy="专业详情来自当前已选中的真实列表行。"
      detailEmptyCopy="请选择学校和专业后查看详情。"
      listScopeCopy="专业列表会在选择学校后按需加载。"
    />
  );
}
