"use client";

import { useEffect, useMemo, useState } from "react";
import { LiveOperationsWorkspace, type FilterControl } from "@/components/live-operations-workspace";
import { getAdminJson, patchAdminJson } from "@/lib/admin-api-client";
import { getAdminOperationsPage } from "@/lib/admin-operations";
import type { AdminRecord } from "@/lib/admin-operations";

type AppUserItem = {
  userId: string;
  phoneMasked: string;
  nickname: string;
  status: "active" | "disabled";
  lastLoginAt: string | null;
  createdAt: string;
};

type AppUsersResponse = {
  items: AppUserItem[];
  total: number;
};

const page = getAdminOperationsPage("users");
const scaffoldDataset = page.datasets[0];

function mapUserToRecord(user: AppUserItem): AdminRecord {
  return {
    id: user.userId,
    nickname: user.nickname,
    phone_masked: user.phoneMasked,
    status: user.status === "active" ? "启用" : "停用",
    role: "普通用户",
    last_login_at: user.lastLoginAt ?? "—",
    created_at: user.createdAt,
    raw_status: user.status,
  };
}

export function UsersLiveWorkspace() {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [records, setRecords] = useState<AdminRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    void getAdminJson<AppUsersResponse>(
      "/admin/app-users",
      {
        keyword,
        status: status || undefined,
        page: 1,
        pageSize: 50,
      },
      { signal: controller.signal },
    )
      .then((response) => {
        setRecords(response.items.map(mapUserToRecord));
        setTotal(response.total);
        setSelectedId((current) => current || response.items[0]?.userId || "");
      })
      .catch((loadError) => {
        if (controller.signal.aborted) {
          return;
        }
        setError(loadError instanceof Error ? loadError.message : "加载用户失败");
        setRecords([]);
        setTotal(0);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [keyword, reloadToken, status]);

  const selectedRecord = useMemo(
    () => records.find((record) => String(record.id) === selectedId) ?? records[0] ?? null,
    [records, selectedId],
  );

  const filters: FilterControl[] = [
    {
      key: "status",
      label: "账号状态",
      value: status,
      options: [
        { label: "全部状态", value: "" },
        { label: "启用", value: "active" },
        { label: "停用", value: "disabled" },
      ],
      onChange: setStatus,
    },
  ];

  async function toggleSelectedStatus() {
    if (!selectedRecord) {
      return;
    }

    const nextStatus = selectedRecord.raw_status === "active" ? "disabled" : "active";
    setSaving(true);
    setError(null);

    try {
      await patchAdminJson(`/admin/app-users/${selectedRecord.id}`, {
        status: nextStatus,
      });
      setReloadToken((token) => token + 1);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "更新用户状态失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-stack">
      <section className="user-admin-toolbar">
        <p>选中用户后可切换账号状态，当前共 {total} 位 App 用户。</p>
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
              ? "停用选中账号"
              : "启用选中账号"}
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
          columns: scaffoldDataset.columns,
          fields: scaffoldDataset.fields,
          detailSections: scaffoldDataset.detailSections,
        }}
        search={{
          value: keyword,
          placeholder: "搜索手机号或昵称",
          onChange: setKeyword,
          helpText: "搜索会命中 /admin/app-users 接口。",
        }}
        filters={filters}
        records={records}
        totalRecords={total}
        selectedId={selectedId || String(selectedRecord?.id ?? "")}
        onSelect={setSelectedId}
        onResetFilters={() => {
          setKeyword("");
          setStatus("");
        }}
        listLoading={loading}
        listError={error}
        listLoadingCopy="正在从后端加载 App 用户。"
        listEmptyCopy="暂无匹配用户，可先通过移动端注册产生数据。"
        onRetryList={() => setReloadToken((token) => token + 1)}
        detailRecord={selectedRecord}
        detailLoading={false}
        detailLoadingCopy="正在加载用户详情。"
        detailEmptyCopy="请选择一个用户查看详情。"
        listScopeCopy="列表数据来自真实后端，角色固定为普通用户。"
      />
    </div>
  );
}
