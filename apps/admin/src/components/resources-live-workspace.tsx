"use client";

import { useEffect, useMemo, useState } from "react";
import { LiveOperationsWorkspace, type FilterControl } from "@/components/live-operations-workspace";
import { getAdminOperationsPage } from "@/lib/admin-operations";
import {
  filterRecordsBySearch,
  getStudyResourceDetail,
  listStudyResources,
  mapStudyResourceDetailToRecord,
  mapStudyResourceListItemToRecord,
  resourcesLiveColumns,
  resourcesLiveDetailSections,
  resourcesLiveFields,
  type StudyResourceListItem,
} from "@/lib/admin-live-data";

const page = getAdminOperationsPage("resources");
const scaffoldDataset = page.datasets[0];

const RESOURCE_TYPE_OPTIONS = [
  { label: "全部资料类型", value: "" },
  { label: "课程", value: "course" },
  { label: "图书", value: "book" },
  { label: "历年真题", value: "past_exam" },
  { label: "公开资源", value: "public_resource" },
  { label: "文章", value: "article" },
] as const;

const STAGE_TAG_OPTIONS = [
  { label: "全部学习阶段", value: "" },
  { label: "基础阶段", value: "foundation" },
  { label: "强化阶段", value: "intensive" },
  { label: "冲刺阶段", value: "final" },
  { label: "复试阶段", value: "interview" },
] as const;

type ResourcesQueryState = {
  q: string;
  resourceType: string;
  stageTag: string;
  subjectId: string;
};

type ListState = {
  records: ReturnType<typeof mapStudyResourceListItemToRecord>[];
  total: number;
  loading: boolean;
  error: string | null;
};

type DetailState = {
  record: ReturnType<typeof mapStudyResourceDetailToRecord> | null;
  loading: boolean;
  error: string | null;
};

function buildSubjectOptions(items: StudyResourceListItem[]) {
  const pairs = new Map<string, string>();

  for (const item of items) {
    if (item.subjectId && item.subjectName) {
      pairs.set(item.subjectId, item.subjectName);
    }
  }

  return [
    { label: "全部科目", value: "" },
    ...Array.from(pairs.entries())
      .sort((left, right) => left[1].localeCompare(right[1], "zh"))
      .map(([value, label]) => ({ label, value })),
  ];
}

export function ResourcesLiveWorkspace() {
  const [query, setQuery] = useState<ResourcesQueryState>({
    q: "",
    resourceType: "",
    stageTag: "",
    subjectId: "",
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
  const [optionSource, setOptionSource] = useState<StudyResourceListItem[]>([]);
  const [reloadToken, setReloadToken] = useState(0);
  const [detailReloadToken, setDetailReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    void listStudyResources({ page: 1, pageSize: 50 }, controller.signal)
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

    void listStudyResources(
      {
        resourceType: query.resourceType || undefined,
        stageTag: query.stageTag || undefined,
        subjectId: query.subjectId || undefined,
        page: 1,
        pageSize: 50,
      },
      controller.signal,
    )
      .then((response) => {
        setListState({
          records: response.items.map(mapStudyResourceListItemToRecord),
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
          error: error instanceof Error ? error.message : "资料列表加载失败。",
        });
      });

    return () => controller.abort();
  }, [query.resourceType, query.stageTag, query.subjectId, reloadToken]);

  const filteredRecords = useMemo(
    () => filterRecordsBySearch(listState.records, query.q),
    [listState.records, query.q],
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

    void getStudyResourceDetail(selectedId, controller.signal)
      .then((detail) => {
        setDetailState({
          record: mapStudyResourceDetailToRecord(detail),
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
          error: error instanceof Error ? error.message : "资料详情加载失败。",
        });
      });

    return () => controller.abort();
  }, [detailReloadToken, selectedId]);

  const subjectOptions = useMemo(
    () => buildSubjectOptions(optionSource),
    [optionSource],
  );

  const filters = useMemo<FilterControl[]>(
    () => [
      {
        key: "resourceType",
        label: "资料类型",
        value: query.resourceType,
        options: [...RESOURCE_TYPE_OPTIONS],
        onChange: (value) => setQuery((current) => ({ ...current, resourceType: value })),
      },
      {
        key: "stageTag",
        label: "学习阶段",
        value: query.stageTag,
        options: [...STAGE_TAG_OPTIONS],
        onChange: (value) => setQuery((current) => ({ ...current, stageTag: value })),
      },
      {
        key: "subjectId",
        label: "科目",
        value: query.subjectId,
        options: subjectOptions,
        onChange: (value) => setQuery((current) => ({ ...current, subjectId: value })),
        disabled: !subjectOptions.some((option) => option.value !== ""),
      },
    ],
    [query.resourceType, query.stageTag, query.subjectId, subjectOptions],
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
        columns: resourcesLiveColumns,
        fields: resourcesLiveFields,
        detailSections: resourcesLiveDetailSections,
      }}
      search={{
        value: query.q,
        placeholder: "按标题、科目、提供方或推荐语搜索",
        onChange: (value) => setQuery((current) => ({ ...current, q: value })),
        helpText: "关键词会在当前已加载的资料结果内本地筛选。",
      }}
      filters={filters}
      records={filteredRecords}
      totalRecords={listState.total}
      selectedId={selectedId}
      onSelect={setSelectedId}
      onResetFilters={() =>
        setQuery({
          q: "",
          resourceType: "",
          stageTag: "",
          subjectId: "",
        })
      }
      listLoading={listState.loading}
      listError={listState.error}
      listLoadingCopy="正在从后端加载资料推荐数据。"
      listEmptyCopy={
        query.q
          ? "当前搜索条件下没有匹配的资料。"
          : "当前筛选条件下没有返回资料数据。"
      }
      onRetryList={() => setReloadToken((value) => value + 1)}
      detailRecord={detailState.record}
      detailLoading={detailState.loading}
      detailError={detailState.error}
      detailLoadingCopy="正在从后端加载资料详情。"
      detailEmptyCopy="请选择一条资料查看详情。"
      onRetryDetail={() => setDetailReloadToken((value) => value + 1)}
      listScopeCopy="资料列表已切换为 study-resources 真实接口返回。"
    />
  );
}
