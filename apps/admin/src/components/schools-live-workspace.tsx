"use client";

import { useEffect, useMemo, useState } from "react";
import { LiveOperationsWorkspace, type FilterControl } from "@/components/live-operations-workspace";
import { getAdminOperationsPage } from "@/lib/admin-operations";
import {
  getSchoolDetail,
  listSchools,
  mapSchoolDetailToRecord,
  mapSchoolListItemToRecord,
  schoolsLiveColumns,
  schoolsLiveDetailSections,
  schoolsLiveFields,
  toSelectOptions,
  type SchoolListItem,
} from "@/lib/admin-live-data";

const page = getAdminOperationsPage("schools");
const scaffoldDataset = page.datasets[0];

type SchoolsQueryState = {
  q: string;
  province: string;
  city: string;
  schoolLevel: string;
  schoolType: string;
};

type ListState = {
  records: ReturnType<typeof mapSchoolListItemToRecord>[];
  total: number;
  loading: boolean;
  error: string | null;
};

type DetailState = {
  record: ReturnType<typeof mapSchoolDetailToRecord> | null;
  loading: boolean;
  error: string | null;
};

function buildOptionList(allLabel: string, values: string[]) {
  return [{ label: allLabel, value: "" }, ...values.map((value) => ({ label: value, value }))];
}

export function SchoolsLiveWorkspace() {
  const [query, setQuery] = useState<SchoolsQueryState>({
    q: "",
    province: "",
    city: "",
    schoolLevel: "",
    schoolType: "",
  });
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
  const [optionSource, setOptionSource] = useState<SchoolListItem[]>([]);
  const [reloadToken, setReloadToken] = useState(0);
  const [detailReloadToken, setDetailReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    void listSchools({ page: 1, pageSize: 50 }, controller.signal)
      .then((response) => {
        setOptionSource(response.items);
      })
      .catch(() => {
        setOptionSource([]);
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

    void listSchools(
      {
        q: query.q,
        province: query.province,
        city: query.city,
        schoolLevel: query.schoolLevel,
        schoolType: query.schoolType,
        page: 1,
        pageSize: 50,
      },
      controller.signal,
    )
      .then((response) => {
        setListState({
          records: response.items.map(mapSchoolListItemToRecord),
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
          records: [],
          total: 0,
          loading: false,
          error: error instanceof Error ? error.message : "Failed to load schools.",
        });
      });

    return () => controller.abort();
  }, [query, reloadToken]);

  useEffect(() => {
    if (!listState.records.length) {
      setSelectedId("");
      return;
    }

    const hasSelected = listState.records.some((record) => String(record.id) === selectedId);
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

    void getSchoolDetail(selectedId, controller.signal)
      .then((detail) => {
        setDetailState({
          record: mapSchoolDetailToRecord(detail),
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
          error: error instanceof Error ? error.message : "Failed to load school detail.",
        });
      });

    return () => controller.abort();
  }, [detailReloadToken, selectedId]);

  const provinceOptions = useMemo(
    () => buildOptionList("全部省份", toSelectOptions(optionSource.map((item) => item.province))),
    [optionSource],
  );

  const cityOptions = useMemo(() => {
    const visibleCities = optionSource
      .filter((item) => !query.province || item.province === query.province)
      .map((item) => item.city);

    return buildOptionList("全部城市", toSelectOptions(visibleCities));
  }, [optionSource, query.province]);

  const levelOptions = useMemo(
    () => buildOptionList("全部层级", toSelectOptions(optionSource.map((item) => item.schoolLevel))),
    [optionSource],
  );

  const typeOptions = useMemo(
    () => buildOptionList("全部类型", toSelectOptions(optionSource.map((item) => item.schoolType))),
    [optionSource],
  );

  const filters = useMemo<FilterControl[]>(
    () => [
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
        onChange: (value) => setQuery((current) => ({ ...current, city: value })),
      },
      {
        key: "schoolLevel",
        label: "层级",
        value: query.schoolLevel,
        options: levelOptions,
        onChange: (value) => setQuery((current) => ({ ...current, schoolLevel: value })),
      },
      {
        key: "schoolType",
        label: "类型",
        value: query.schoolType,
        options: typeOptions,
        onChange: (value) => setQuery((current) => ({ ...current, schoolType: value })),
      },
    ],
    [cityOptions, levelOptions, provinceOptions, query, typeOptions],
  );

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
        columns: schoolsLiveColumns,
        fields: schoolsLiveFields,
        detailSections: schoolsLiveDetailSections,
      }}
      search={{
        value: query.q,
        placeholder: "按学校名称或关联专业搜索",
        onChange: (value) => setQuery((current) => ({ ...current, q: value })),
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
      listScopeCopy="当前列表已切换为真实后端返回，不再展示静态样例数据。"
    />
  );
}
