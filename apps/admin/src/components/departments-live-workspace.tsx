"use client";

import { useEffect, useMemo, useState } from "react";
import { LiveOperationsWorkspace, type FilterControl } from "@/components/live-operations-workspace";
import { getAdminOperationsPage } from "@/lib/admin-operations";
import {
  departmentsLiveColumns,
  departmentsLiveDetailSections,
  departmentsLiveFields,
  getAdminDepartment,
  listAdminDepartments,
  listAdminSchools,
  mapAdminDepartmentToRecord,
  type AdminSchoolSummary,
} from "@/lib/admin-live-data";

const page = getAdminOperationsPage("departments");
const scaffoldDataset = page.datasets[0];

type DepartmentsQueryState = {
  q: string;
  schoolId: string;
  status: string;
};

type ListState = {
  records: ReturnType<typeof mapAdminDepartmentToRecord>[];
  total: number;
  loading: boolean;
  error: string | null;
};

type DetailState = {
  record: ReturnType<typeof mapAdminDepartmentToRecord> | null;
  loading: boolean;
  error: string | null;
};

function buildOptionList(allLabel: string, values: string[]) {
  return [{ label: allLabel, value: "" }, ...values.map((value) => ({ label: value, value }))];
}

export function DepartmentsLiveWorkspace() {
  const [query, setQuery] = useState<DepartmentsQueryState>({
    q: "",
    schoolId: "",
    status: "",
  });
  const [selectedId, setSelectedId] = useState("");
  const [schoolOptions, setSchoolOptions] = useState<AdminSchoolSummary[]>([]);
  const [listState, setListState] = useState<ListState>({
    records: [],
    total: 0,
    loading: true,
    error: null,
  });
  const [detailState, setDetailState] = useState<DetailState>({
    record: null,
    loading: false,
    error: null,
  });
  const [reloadToken, setReloadToken] = useState(0);
  const [detailReloadToken, setDetailReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    void listAdminSchools({ page: 1, pageSize: 50 }, controller.signal)
      .then((response) => {
        setSchoolOptions(response.items);
      })
      .catch(() => {
        setSchoolOptions([]);
      });

    return () => controller.abort();
  }, [reloadToken]);

  useEffect(() => {
    const controller = new AbortController();

    setListState((current) => ({
      ...current,
      loading: true,
      error: null,
    }));

    void listAdminDepartments(
      {
        keyword: query.q,
        schoolId: query.schoolId || undefined,
        status: query.status ? (query.status as "active" | "inactive") : undefined,
        page: 1,
        pageSize: 50,
      },
      controller.signal,
    )
      .then((response) => {
        setListState({
          records: response.items.map(mapAdminDepartmentToRecord),
          total: response.total,
          loading: false,
          error: null,
        });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setListState({
          records: [],
          total: 0,
          loading: false,
          error: error instanceof Error ? error.message : "院系列表加载失败。",
        });
      });

    return () => controller.abort();
  }, [query, reloadToken]);

  useEffect(() => {
    if (!selectedId) {
      setDetailState({ record: null, loading: false, error: null });
      return;
    }

    const controller = new AbortController();

    setDetailState((current) => ({
      ...current,
      loading: true,
      error: null,
    }));

    void getAdminDepartment(selectedId, controller.signal)
      .then((item) => {
        setDetailState({
          record: mapAdminDepartmentToRecord(item),
          loading: false,
          error: null,
        });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setDetailState({
          record: null,
          loading: false,
          error: error instanceof Error ? error.message : "院系详情加载失败。",
        });
      });

    return () => controller.abort();
  }, [selectedId, detailReloadToken]);

  const schoolFilterOptions = useMemo(
    () =>
      buildOptionList(
        "全部学校",
        schoolOptions.map((school) => school.name),
      ).map((option) => {
        if (option.value === "") {
          return option;
        }
        const school = schoolOptions.find((item) => item.name === option.value);
        return {
          label: option.label,
          value: school?.schoolId ?? option.value,
        };
      }),
    [schoolOptions],
  );

  const filters = useMemo<FilterControl[]>(
    () => [
      {
        key: "status",
        label: "展示状态",
        value: query.status,
        options: [
          { label: "全部状态", value: "" },
          { label: "启用", value: "active" },
          { label: "停用", value: "inactive" },
        ],
        onChange: (value) => setQuery((current) => ({ ...current, status: value })),
      },
      {
        key: "schoolId",
        label: "所属学校",
        value: query.schoolId,
        options: schoolFilterOptions,
        onChange: (value) => setQuery((current) => ({ ...current, schoolId: value })),
      },
    ],
    [query, schoolFilterOptions],
  );

  const selectedRecord = useMemo(
    () => listState.records.find((record) => String(record.id) === selectedId) ?? null,
    [listState.records, selectedId],
  );

  return (
    <div className="page-stack">
      <section className="user-admin-toolbar">
        <p>院系列表已接入 PostgreSQL 只读 Live API，按学校归属与状态筛选。</p>
        <button
          type="button"
          className="mini-action"
          onClick={() => {
            setReloadToken((value) => value + 1);
            setDetailReloadToken((value) => value + 1);
          }}
        >
          刷新列表
        </button>
      </section>

      <LiveOperationsWorkspace
        page={page}
        dataset={{
          title: scaffoldDataset.title,
          description:
            "展示数据库中的院系记录，列表 school 列显示学校名称，详情抽屉保留 school_id 供联调核对。",
          tableName: scaffoldDataset.tableName,
          templateName: scaffoldDataset.templateName,
          importActions: scaffoldDataset.importActions,
          revisionActions: scaffoldDataset.revisionActions,
          columns: departmentsLiveColumns,
          fields: departmentsLiveFields,
          detailSections: departmentsLiveDetailSections,
        }}
        search={{
          value: query.q,
          placeholder: "按院系名称、编码或学校搜索",
          onChange: (value) => setQuery((current) => ({ ...current, q: value })),
          helpText: "搜索会命中 /admin/departments 列表接口。",
        }}
        filters={filters}
        records={listState.records}
        totalRecords={listState.total}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onResetFilters={() =>
          setQuery({
            q: "",
            schoolId: "",
            status: "",
          })
        }
        listLoading={listState.loading}
        listError={listState.error}
        listLoadingCopy="正在从后端加载院系数据。"
        listEmptyCopy="当前筛选条件下没有匹配的院系。"
        onRetryList={() => setReloadToken((value) => value + 1)}
        detailRecord={detailState.record ?? selectedRecord}
        detailLoading={detailState.loading}
        detailError={detailState.error}
        detailLoadingCopy="正在从后端加载院系详情。"
        detailEmptyCopy="请选择一个院系查看详情。"
        onRetryDetail={() => setDetailReloadToken((value) => value + 1)}
        listScopeCopy="列表与详情来自 /admin/departments（只读）。"
      />
    </div>
  );
}
