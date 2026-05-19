"use client";

import { useEffect, useState } from "react";
import type {
  AdminDataset,
  AdminField,
  AdminOperationsPage,
  AdminRecord,
  AdminScalar,
} from "@/lib/admin-operations";

type OperationsWorkspaceProps = {
  page: AdminOperationsPage;
};

function getPrimaryLabel(record: AdminRecord, fallback: string): string {
  const candidates = ["title", "name", "short_name", "code"];

  for (const key of candidates) {
    const value = record[key];

    if (value !== undefined && value !== null && formatValue(value) !== "NULL") {
      return formatValue(value);
    }
  }

  if (record.exam_year !== undefined && record.exam_year !== null) {
    return `${fallback} / ${formatValue(record.exam_year)}`;
  }

  return fallback;
}

function getRecordMeta(record: AdminRecord): string[] {
  const metaKeys = [
    "code",
    "program_id",
    "exam_year",
    "status",
    "source_confidence",
    "degree_type",
    "province",
    "source_type",
  ];

  return metaKeys
    .map((key) => record[key])
    .filter((value) => value !== undefined && value !== null && formatValue(value) !== "NULL")
    .slice(0, 4)
    .map((value) => formatValue(value));
}

function formatValue(value: AdminScalar): string {
  if (value === null) {
    return "NULL";
  }

  if (typeof value === "boolean") {
    return String(value);
  }

  return String(value);
}

function getTone(key: string, value: AdminScalar): string {
  if (value === null) {
    return "muted";
  }

  const text = formatValue(value);

  if (key === "status") {
    if (text === "active") {
      return "success";
    }

    if (text === "pending") {
      return "warning";
    }

    if (text === "invalid" || text === "inactive") {
      return "danger";
    }
  }

  if (key === "source_confidence") {
    if (text === "official") {
      return "success";
    }

    if (text === "estimated") {
      return "warning";
    }

    if (text === "manual") {
      return "accent";
    }
  }

  if (key === "degree_type") {
    return text === "academic" ? "success" : "accent";
  }

  return "default";
}

function getField(dataset: AdminDataset, key: string): AdminField | undefined {
  return dataset.fields.find((field) => field.key === key);
}

function matchesSearch(record: AdminRecord, searchTerm: string): boolean {
  if (!searchTerm) {
    return true;
  }

  const normalized = searchTerm.toLowerCase();

  return Object.values(record).some((value) => formatValue(value).toLowerCase().includes(normalized));
}

function matchesFilters(record: AdminRecord, filters: Record<string, string>): boolean {
  return Object.entries(filters).every(([key, expected]) => {
    if (!expected) {
      return true;
    }

    if (expected === "null") {
      return record[key] === null;
    }

    return formatValue(record[key]).toLowerCase() === expected.toLowerCase();
  });
}

export function OperationsWorkspace({ page }: OperationsWorkspaceProps) {
  const [activeDatasetId, setActiveDatasetId] = useState(page.datasets[0]?.id ?? "");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState<string>("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const activeDataset =
    page.datasets.find((dataset) => dataset.id === activeDatasetId) ?? page.datasets[0];

  if (!activeDataset) {
    return null;
  }

  useEffect(() => {
    setFilters({});
    setSearchTerm("");
    setSelectedId(activeDataset?.records[0]?.id ? String(activeDataset.records[0].id) : "");
  }, [activeDatasetId, activeDataset]);

  const filteredRecords = activeDataset.records.filter(
    (record) => matchesSearch(record, searchTerm) && matchesFilters(record, filters),
  );

  const selectedRecord =
    filteredRecords.find((record) => String(record.id) === selectedId) ??
    filteredRecords[0] ??
    activeDataset.records[0];

  const requiredFieldCount = activeDataset.fields.filter((field) => field.required).length;
  const nullableFieldCount = activeDataset.fields.length - requiredFieldCount;
  const selectedTitle = selectedRecord
    ? getPrimaryLabel(selectedRecord, activeDataset.tableName)
    : activeDataset.tableName;
  const selectedMeta = selectedRecord ? getRecordMeta(selectedRecord) : [];

  return (
    <div className="page-stack">
      <section className="hero-card workspace-hero">
        <div>
          <span className="eyebrow">{page.eyebrow}</span>
          <h1>{page.title}</h1>
          <p className="hero-copy">{page.description}</p>
        </div>
        <div className="workspace-hero-meta">
          <div className="hero-stat-card">
            <span className="hero-stat-label">related tables</span>
            <strong>{page.relatedTables.join(" / ")}</strong>
          </div>
          <div className="hero-stat-card">
            <span className="hero-stat-label">csv template</span>
            <strong>{activeDataset.templateName}</strong>
          </div>
          <div className="hero-stat-card">
            <span className="hero-stat-label">field coverage</span>
            <strong>
              {requiredFieldCount} required / {nullableFieldCount} nullable
            </strong>
          </div>
        </div>
      </section>

      {page.datasets.length > 1 ? (
        <section className="section-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Dataset Tabs</span>
              <h2>年份子表切换</h2>
            </div>
            <p>统一入口下切换四张年份表，保持 program_* 子表的结构边界清晰可见。</p>
          </div>
          <div className="dataset-tab-row">
            {page.datasets.map((dataset) => {
              const isActive = dataset.id === activeDataset.id;

              return (
                <button
                  key={dataset.id}
                  type="button"
                  className={isActive ? "dataset-tab active" : "dataset-tab"}
                  onClick={() => setActiveDatasetId(dataset.id)}
                >
                  <span className="dataset-tab-title">{dataset.title}</span>
                  <span className="dataset-tab-copy">{dataset.description}</span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="workspace-summary-grid">
        <article className="insight-card">
          <span className="eyebrow">Table</span>
          <h3>{activeDataset.tableName}</h3>
          <p>{activeDataset.description}</p>
          <ul className="tag-list">
            <li>模板: {activeDataset.templateName}</li>
            <li>字段数: {activeDataset.fields.length}</li>
            <li>样例记录: {activeDataset.records.length}</li>
          </ul>
        </article>

        <article className="insight-card">
          <span className="eyebrow">Import</span>
          <h3>批量导入流程</h3>
          <div className="action-list">
            {activeDataset.importActions.map((action) => (
              <button
                key={action.label}
                type="button"
                className={action.tone === "accent" ? "action-card accent" : "action-card"}
              >
                <strong>{action.label}</strong>
                <span>{action.description}</span>
              </button>
            ))}
          </div>
        </article>

        <article className="insight-card">
          <span className="eyebrow">Revision</span>
          <h3>人工修订流程</h3>
          <div className="action-list">
            {activeDataset.revisionActions.map((action) => (
              <button
                key={action.label}
                type="button"
                className={action.tone === "accent" ? "action-card accent" : "action-card"}
              >
                <strong>{action.label}</strong>
                <span>{action.description}</span>
              </button>
            ))}
          </div>
        </article>
      </section>

      <section className="section-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Filters</span>
            <h2>列表与筛选</h2>
          </div>
          <p>搜索、枚举筛选和样例结果数已经按当前表结构对齐，便于运营先定位记录，再决定导入、核验或人工修订动作。</p>
        </div>

        <div className="filter-toolbar">
          <label className="filter-field filter-search">
            <span>search</span>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={`搜索 ${activeDataset.tableName} 当前样例字段`}
            />
          </label>

          {activeDataset.filters.map((filter) => (
            <label key={filter.key} className="filter-field">
              <span>{filter.label}</span>
              <select
                value={filters[filter.key] ?? ""}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    [filter.key]: event.target.value,
                  }))
                }
              >
                {filter.options.map((option) => (
                  <option key={`${filter.key}-${option.value}`} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ))}

          <button
            type="button"
            className="toolbar-reset"
            onClick={() => {
              setSearchTerm("");
              setFilters({});
            }}
          >
            清空筛选
          </button>
        </div>

        <div className="workspace-main-grid">
          <div className="record-list-panel">
            <div className="list-header">
              <div>
                <h3>{activeDataset.title} records</h3>
                <p>
                  筛选后共 {filteredRecords.length} 条样例记录。当前表头、字段顺序和筛选项都以{" "}
                  {activeDataset.tableName} 为准。
                </p>
              </div>
              <div className="list-metadata">
                <span className="list-meta-pill">schema: {activeDataset.tableName}</span>
                <span className="list-meta-pill">records: {filteredRecords.length}</span>
              </div>
            </div>

            <div className="table-scroll">
              <table className="record-table">
                <thead>
                  <tr>
                    {activeDataset.columns.map((column) => (
                      <th key={column.key}>{column.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => {
                    const isSelected = String(record.id) === String(selectedRecord?.id);

                    return (
                      <tr
                        key={String(record.id)}
                        className={isSelected ? "selected" : undefined}
                        onClick={() => setSelectedId(String(record.id))}
                      >
                        {activeDataset.columns.map((column) => {
                          const value = record[column.key];
                          const tone = getTone(column.key, value);

                          return (
                            <td key={`${record.id}-${column.key}`}>
                              <span className={`table-value tone-${tone}`}>{formatValue(value)}</span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="detail-drawer">
            <div className="detail-drawer-top">
              <div>
                <span className="eyebrow">Detail Drawer</span>
                <h3>{selectedTitle}</h3>
                {selectedMeta.length ? (
                  <div className="detail-chip-row">
                    {selectedMeta.map((item) => (
                      <span key={item} className="detail-chip">
                        {item}
                      </span>
                    ))}
                  </div>
                ) : null}
                <p>
                  详情区用统一表单承接 schema 字段，方便运营对照主键、来源、状态和备注信息完成核验，再进入后续编辑或提交流程。
                </p>
              </div>
              <div className="detail-action-row">
                <button type="button" className="mini-action accent">
                  人工修订
                </button>
                <button type="button" className="mini-action">
                  批量导入映射
                </button>
              </div>
            </div>

            {selectedRecord ? (
              <div className="detail-section-stack">
                {activeDataset.detailSections.map((section) => (
                  <section key={section.title} className="detail-section-card">
                    <div className="detail-section-head">
                      <h4>{section.title}</h4>
                      <p>{section.description}</p>
                    </div>

                    <div className="detail-form-grid">
                      {section.fields.map((fieldKey) => {
                        const field = getField(activeDataset, fieldKey);

                        if (!field) {
                          return null;
                        }

                        return (
                          <label key={field.key} className="detail-field">
                            <span className="detail-field-top">
                              <strong>{field.label}</strong>
                              <em>{field.type}</em>
                            </span>
                            {field.type === "text" ? (
                              <textarea readOnly value={formatValue(selectedRecord[field.key])} rows={3} />
                            ) : (
                              <input readOnly value={formatValue(selectedRecord[field.key])} />
                            )}
                            <span className="detail-field-help">
                              {field.required ? "required" : "nullable"} · {field.description}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="empty-drawer">
                <p>当前筛选结果为空，后续这里可以承接空状态、批量导入报错与待修订列表。</p>
              </div>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}
