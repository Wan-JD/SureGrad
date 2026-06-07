"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LiveOperationsWorkspace,
  type FilterControl,
} from "@/components/live-operations-workspace";
import { patchAdminJson } from "@/lib/admin-api-client";
import { getAdminOperationsPage } from "@/lib/admin-operations";
import {
  getAdminSchoolFacets,
  getAdminSchool,
  listAdminSchools,
  mapAdminSchoolToRecord,
  schoolsLiveColumns,
  schoolsLiveDetailSections,
  schoolsLiveFields,
  type AdminSchoolFacets,
} from "@/lib/admin-live-data";

const page = getAdminOperationsPage("schools");
const scaffoldDataset = page.datasets[0];

type SchoolsQueryState = {
  q: string;
  province: string;
  city: string;
  schoolLevel: string;
  schoolType: string;
  status: string;
};

type ListState = {
  records: ReturnType<typeof mapAdminSchoolToRecord>[];
  total: number;
  loading: boolean;
  error: string | null;
};

type DetailState = {
  record: ReturnType<typeof mapAdminSchoolToRecord> | null;
  loading: boolean;
  error: string | null;
};

const emptyFacets: AdminSchoolFacets = {
  provinces: [],
  cities: [],
  schoolLevels: [],
  schoolTypes: [],
  statuses: [],
};

function buildOptionList(
  allLabel: string,
  values: Array<{ value: string; count: number }>,
) {
  return [
    { label: allLabel, value: "" },
    ...values.map((option) => ({
      label: `${option.value} (${option.count})`,
      value: option.value,
    })),
  ];
}

export function SchoolsLiveWorkspace() {
  const [query, setQuery] = useState<SchoolsQueryState>({
    q: "",
    province: "",
    city: "",
    schoolLevel: "",
    schoolType: "",
    status: "",
  });
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState("");
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
  const [facets, setFacets] = useState<AdminSchoolFacets>(emptyFacets);
  const [reloadToken, setReloadToken] = useState(0);
  const [detailReloadToken, setDetailReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    void getAdminSchoolFacets(controller.signal)
      .then((response) => {
        setFacets(response);
      })
      .catch(() => {
        setFacets(emptyFacets);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    setListState((current) => ({
      ...current,
      loading: true,
      error: null,
    }));

    void listAdminSchools(
      {
        keyword: query.q,
        province: query.province,
        city: query.city,
        schoolLevel: query.schoolLevel,
        schoolType: query.schoolType,
        status: query.status
          ? (query.status as "active" | "inactive")
          : undefined,
        page: 1,
        pageSize: 50,
      },
      controller.signal,
    )
      .then((response) => {
        setListState({
          records: response.items.map(mapAdminSchoolToRecord),
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
          error: error instanceof Error ? error.message : "学校列表加载失败。",
        });
      });

    return () => controller.abort();
  }, [query, reloadToken]);

  useEffect(() => {
    if (!listState.records.length) {
      setSelectedId("");
      return;
    }

    const hasSelected = listState.records.some(
      (record) => String(record.id) === selectedId,
    );
    if (!hasSelected) {
      setSelectedId(String(listState.records[0].id));
    }
  }, [listState.records, selectedId]);

  useEffect(() => {
    if (!selectedId) {
      setDetailState({
        record: null,
        loading: false,
        error: null,
      });
      return;
    }

    const controller = new AbortController();

    setDetailState((current) => ({
      ...current,
      loading: true,
      error: null,
    }));

    void getAdminSchool(selectedId, controller.signal)
      .then((detail) => {
        setDetailState({
          record: mapAdminSchoolToRecord(detail),
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
          error: error instanceof Error ? error.message : "学校详情加载失败。",
        });
      });

    return () => controller.abort();
  }, [detailReloadToken, selectedId]);

  const provinceOptions = useMemo(
    () => buildOptionList("全部省份", facets.provinces),
    [facets.provinces],
  );

  const cityOptions = useMemo(
    () => buildOptionList("全部城市", facets.cities),
    [facets.cities],
  );

  const levelOptions = useMemo(
    () => buildOptionList("全部层级", facets.schoolLevels),
    [facets.schoolLevels],
  );

  const typeOptions = useMemo(
    () => buildOptionList("全部类型", facets.schoolTypes),
    [facets.schoolTypes],
  );

  const selectedRecord = useMemo(
    () =>
      listState.records.find((record) => String(record.id) === selectedId) ??
      null,
    [listState.records, selectedId],
  );

  async function toggleSelectedStatus() {
    if (!selectedRecord) {
      return;
    }

    const nextStatus =
      selectedRecord.raw_status === "active" ? "inactive" : "active";
    setSaving(true);
    setListState((current) => ({ ...current, error: null }));

    try {
      await patchAdminJson(`/admin/schools/${selectedRecord.id}`, {
        status: nextStatus,
      });
      setReloadToken((value) => value + 1);
      setDetailReloadToken((value) => value + 1);
    } catch (error: unknown) {
      setListState((current) => ({
        ...current,
        error: error instanceof Error ? error.message : "学校状态更新失败。",
      }));
    } finally {
      setSaving(false);
    }
  }

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
        onChange: (value) =>
          setQuery((current) => ({ ...current, status: value })),
      },
      {
        key: "province",
        label: "省份",
        value: query.province,
        options: provinceOptions,
        onChange: (value) => {
          setQuery((current) => ({
            ...current,
            province: value,
            city: "",
          }));
        },
      },
      {
        key: "city",
        label: "城市",
        value: query.city,
        options: cityOptions,
        onChange: (value) =>
          setQuery((current) => ({ ...current, city: value })),
      },
      {
        key: "schoolLevel",
        label: "层级",
        value: query.schoolLevel,
        options: levelOptions,
        onChange: (value) =>
          setQuery((current) => ({ ...current, schoolLevel: value })),
      },
      {
        key: "schoolType",
        label: "类型",
        value: query.schoolType,
        options: typeOptions,
        onChange: (value) =>
          setQuery((current) => ({ ...current, schoolType: value })),
      },
    ],
    [cityOptions, levelOptions, provinceOptions, query, typeOptions],
  );

  return (
    <div className="page-stack">
      <section className="user-admin-toolbar">
        <p>学校列表已接入 Admin 写接口，可筛选停用学校并切换展示状态。</p>
        <button
          type="button"
          className="mini-action"
          disabled={!selectedRecord || saving}
          onClick={() => {
            void toggleSelectedStatus();
          }}
        >
          {saving
            ? "保存中…"
            : selectedRecord?.raw_status === "active"
              ? "停用选中学校"
              : "启用选中学校"}
        </button>
      </section>

      <LiveOperationsWorkspace
        page={page}
        dataset={{
          title: scaffoldDataset.title,
          description: scaffoldDataset.description,
          tableName: scaffoldDataset.tableName,
          templateName: scaffoldDataset.templateName,
          importActions: scaffoldDataset.importActions,
          revisionActions: scaffoldDataset.revisionActions,
          columns: schoolsLiveColumns,
          fields: schoolsLiveFields,
          detailSections: schoolsLiveDetailSections,
        }}
        search={{
          value: query.q,
          placeholder: "按学校名称或关联专业搜索",
          onChange: (value) =>
            setQuery((current) => ({ ...current, q: value })),
          helpText: "搜索会直接命中后端学校列表接口。",
        }}
        filters={filters}
        records={listState.records}
        totalRecords={listState.total}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onResetFilters={() =>
          setQuery({
            q: "",
            province: "",
            city: "",
            schoolLevel: "",
            schoolType: "",
            status: "",
          })
        }
        listLoading={listState.loading}
        listError={listState.error}
        listLoadingCopy="正在从后端加载学校数据。"
        listEmptyCopy="当前筛选条件下没有匹配的学校。"
        onRetryList={() => setReloadToken((value) => value + 1)}
        detailRecord={detailState.record}
        detailLoading={detailState.loading}
        detailError={detailState.error}
        detailLoadingCopy="正在从后端加载学校详情。"
        detailEmptyCopy="请选择一所学校查看详情。"
        onRetryDetail={() => setDetailReloadToken((value) => value + 1)}
        listScopeCopy="列表与详情来自 /admin/schools，支持启用/停用写操作。"
      />
    </div>
  );
}
