"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { LiveOperationsWorkspace, type FilterControl } from "@/components/live-operations-workspace";
import { getAdminJson, patchAdminJson, postAdminJson } from "@/lib/admin-api-client";
import { getAdminOperationsPage } from "@/lib/admin-operations";
import type { AdminRecord } from "@/lib/admin-operations";

type StaffItem = {
  adminUserId: string;
  username: string;
  displayName: string;
  role: "super_admin" | "admin";
  status: "active" | "disabled";
  lastLoginAt: string | null;
  createdAt: string;
};

type StaffResponse = {
  items: StaffItem[];
  total: number;
};

const page = getAdminOperationsPage("staff");
const scaffoldDataset = page.datasets[0];

function roleLabel(role: StaffItem["role"]) {
  return role === "super_admin" ? "超级管理员" : "管理员";
}

function mapStaffToRecord(staff: StaffItem): AdminRecord {
  return {
    id: staff.adminUserId,
    display_name: staff.displayName,
    username: staff.username,
    role: roleLabel(staff.role),
    status: staff.status === "active" ? "启用" : "停用",
    last_login_at: staff.lastLoginAt ?? "—",
    created_at: staff.createdAt,
    raw_role: staff.role,
    raw_status: staff.status,
  };
}

export function StaffLiveWorkspace() {
  const [keyword, setKeyword] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [records, setRecords] = useState<AdminRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    username: "",
    displayName: "",
    password: "",
    role: "admin" as "super_admin" | "admin",
  });

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    void getAdminJson<StaffResponse>(
      "/admin/staff",
      {
        keyword,
        role: role || undefined,
        status: status || undefined,
        page: 1,
        pageSize: 50,
      },
      { signal: controller.signal },
    )
      .then((response) => {
        setRecords(response.items.map(mapStaffToRecord));
        setTotal(response.total);
        setSelectedId((current) => current || response.items[0]?.adminUserId || "");
      })
      .catch((loadError) => {
        if (controller.signal.aborted) {
          return;
        }
        setError(loadError instanceof Error ? loadError.message : "加载管理员失败");
        setRecords([]);
        setTotal(0);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [keyword, reloadToken, role, status]);

  const selectedRecord = useMemo(
    () => records.find((record) => String(record.id) === selectedId) ?? records[0] ?? null,
    [records, selectedId],
  );

  const filters: FilterControl[] = [
    {
      key: "role",
      label: "后台角色",
      value: role,
      options: [
        { label: "全部角色", value: "" },
        { label: "超级管理员", value: "super_admin" },
        { label: "管理员", value: "admin" },
      ],
      onChange: setRole,
    },
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

  async function updateSelected(patch: {
    role?: "super_admin" | "admin";
    status?: "active" | "disabled";
  }) {
    if (!selectedRecord) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await patchAdminJson(`/admin/staff/${selectedRecord.id}`, patch);
      setReloadToken((token) => token + 1);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "更新管理员失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await postAdminJson("/admin/staff", createForm);
      setShowCreateForm(false);
      setCreateForm({
        username: "",
        displayName: "",
        password: "",
        role: "admin",
      });
      setReloadToken((token) => token + 1);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "创建管理员失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-stack">
      <section className="user-admin-toolbar">
        <p>超级管理员可在此新增账号、调整角色与启用状态，当前共 {total} 个后台账号。</p>
        <div className="user-admin-toolbar-actions">
          <button type="button" className="mini-action" onClick={() => setShowCreateForm(true)}>
            新增管理员
          </button>
          <button
            type="button"
            className="mini-action"
            disabled={!selectedRecord || saving}
            onClick={() => {
              void updateSelected({ role: "super_admin" });
            }}
          >
            升为超级管理员
          </button>
          <button
            type="button"
            className="mini-action"
            disabled={!selectedRecord || saving}
            onClick={() => {
              void updateSelected({ role: "admin" });
            }}
          >
            降为管理员
          </button>
          <button
            type="button"
            className="mini-action"
            disabled={!selectedRecord || saving}
            onClick={() => {
              void updateSelected({
                status: selectedRecord?.raw_status === "active" ? "disabled" : "active",
              });
            }}
          >
            {selectedRecord?.raw_status === "active" ? "停用选中账号" : "启用选中账号"}
          </button>
        </div>
      </section>

      {showCreateForm ? (
        <section className="admin-inline-form">
          <h2>新增管理员</h2>
          <form onSubmit={handleCreate}>
            <label>
              用户名
              <input
                value={createForm.username}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    username: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label>
              显示名
              <input
                value={createForm.displayName}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    displayName: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label>
              初始密码
              <input
                type="password"
                value={createForm.password}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label>
              角色
              <select
                value={createForm.role}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    role: event.target.value as "super_admin" | "admin",
                  }))
                }
              >
                <option value="admin">管理员</option>
                <option value="super_admin">超级管理员</option>
              </select>
            </label>
            <div className="admin-inline-form-actions">
              <button type="submit" disabled={saving}>
                {saving ? "创建中…" : "创建"}
              </button>
              <button type="button" onClick={() => setShowCreateForm(false)}>
                取消
              </button>
            </div>
          </form>
        </section>
      ) : null}

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
          placeholder: "搜索用户名或显示名",
          onChange: setKeyword,
          helpText: "仅超级管理员可访问 /admin/staff。",
        }}
        filters={filters}
        records={records}
        totalRecords={total}
        selectedId={selectedId || String(selectedRecord?.id ?? "")}
        onSelect={setSelectedId}
        onResetFilters={() => {
          setKeyword("");
          setRole("");
          setStatus("");
        }}
        listLoading={loading}
        listError={error}
        listLoadingCopy="正在从后端加载后台账号。"
        listEmptyCopy="暂无后台账号，可通过「新增管理员」创建。"
        onRetryList={() => setReloadToken((token) => token + 1)}
        detailRecord={selectedRecord}
        detailLoading={false}
        detailLoadingCopy="正在加载后台账号详情。"
        detailEmptyCopy="请选择一个后台账号查看详情。"
        listScopeCopy="列表数据来自真实后端，支持角色升降与启停。"
      />
    </div>
  );
}
