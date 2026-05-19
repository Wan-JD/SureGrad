"use client";

import type {
  AdminAction,
  AdminColumn,
  AdminDetailSection,
  AdminField,
  AdminOperationsPage,
  AdminRecord,
} from "@/lib/admin-operations";
import {
  formatAdminValue,
  getAdminField,
  getAdminPrimaryLabel,
  getAdminRecordMeta,
  getAdminTone,
} from "@/lib/admin-live-data";

type FilterOption = {
  label: string;
  value: string;
};

export type FilterControl = {
  key: string;
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (_value: string) => void;
  disabled?: boolean;
};

type SearchControl = {
  value: string;
  placeholder: string;
  onChange: (_value: string) => void;
  disabled?: boolean;
  label?: string;
  helpText?: string;
};

type DatasetMeta = {
  title: string;
  description: string;
  tableName: string;
  templateName: string;
  importActions: AdminAction[];
  revisionActions: AdminAction[];
  columns: AdminColumn[];
  fields: AdminField[];
  detailSections: AdminDetailSection[];
};

type LiveOperationsWorkspaceProps = {
  page: AdminOperationsPage;
  dataset: DatasetMeta;
  search: SearchControl;
  filters: FilterControl[];
  records: AdminRecord[];
  totalRecords: number;
  selectedId: string;
  onSelect: (_id: string) => void;
  onResetFilters: () => void;
  listLoading: boolean;
  listError?: string | null;
  listLoadingCopy: string;
  listEmptyCopy: string;
  onRetryList?: () => void;
  detailRecord?: AdminRecord | null;
  detailLoading: boolean;
  detailError?: string | null;
  detailLoadingCopy: string;
  detailEmptyCopy: string;
  onRetryDetail?: () => void;
  listScopeCopy?: string;
};

function StatusPanel({
  tone,
  title,
  description,
  actionLabel,
  onAction,
}: {
  tone: "default" | "error" | "empty";
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className={`status-panel${tone === "default" ? "" : ` ${tone}`}`}>
      <div className="status-panel-copy">
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      {actionLabel && onAction ? (
        <button type="button" className="mini-action" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export function LiveOperationsWorkspace({
  page,
  dataset,
  search,
  filters,
  records,
  totalRecords,
  selectedId,
  onSelect,
  onResetFilters,
  listLoading,
  listError,
  listLoadingCopy,
  listEmptyCopy,
  onRetryList,
  detailRecord,
  detailLoading,
  detailError,
  detailLoadingCopy,
  detailEmptyCopy,
  onRetryDetail,
  listScopeCopy,
}: LiveOperationsWorkspaceProps) {
  const requiredFieldCount = dataset.fields.filter((field) => field.required).length;
  const nullableFieldCount = dataset.fields.length - requiredFieldCount;
  const selectedRecord = records.find((record) => String(record.id) === selectedId) ?? records[0] ?? null;
  const drawerRecord = detailRecord ?? selectedRecord;
  const selectedTitle = drawerRecord
    ? getAdminPrimaryLabel(drawerRecord, dataset.tableName)
    : dataset.tableName;
  const selectedMeta = drawerRecord ? getAdminRecordMeta(drawerRecord) : [];

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
            <strong>{dataset.templateName}</strong>
          </div>
          <div className="hero-stat-card">
            <span className="hero-stat-label">field coverage</span>
            <strong>
              {requiredFieldCount} required / {nullableFieldCount} nullable
            </strong>
          </div>
        </div>
      </section>

      <section className="workspace-summary-grid">
        <article className="insight-card">
          <span className="eyebrow">Table</span>
          <h3>{dataset.tableName}</h3>
          <p>{dataset.description}</p>
          <ul className="tag-list">
            <li>template: {dataset.templateName}</li>
            <li>fields: {dataset.fields.length}</li>
            <li>records: {records.length}</li>
          </ul>
        </article>

        <article className="insight-card">
          <span className="eyebrow">Import</span>
          <h3>Import Entry Points</h3>
          <div className="action-list">
            {dataset.importActions.map((action) => (
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
          <h3>Revision Entry Points</h3>
          <div className="action-list">
            {dataset.revisionActions.map((action) => (
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
            <h2>Live List and Drawer</h2>
          </div>
          <p>
            Real data now flows through the table and detail drawer. Loading, empty, and error
            states stay visible inside the same scaffold.
          </p>
        </div>

        <div className="filter-toolbar">
          <label className="filter-field filter-search">
            <span>{search.label ?? "search"}</span>
            <input
              value={search.value}
              onChange={(event) => search.onChange(event.target.value)}
              placeholder={search.placeholder}
              disabled={search.disabled}
            />
            {search.helpText ? <small className="filter-note">{search.helpText}</small> : null}
          </label>

          {filters.map((filter) => (
            <label key={filter.key} className="filter-field">
              <span>{filter.label}</span>
              <select
                value={filter.value}
                onChange={(event) => filter.onChange(event.target.value)}
                disabled={filter.disabled}
              >
                {filter.options.map((option) => (
                  <option key={`${filter.key}-${option.value}`} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ))}

          <button type="button" className="toolbar-reset" onClick={onResetFilters}>
            reset
          </button>
        </div>

        <div className="workspace-main-grid">
          <div className="record-list-panel">
            <div className="list-header">
              <div>
                <h3>{dataset.title} records</h3>
                <p>
                  Showing {records.length} row{records.length === 1 ? "" : "s"}
                  {totalRecords > records.length ? ` from ${totalRecords} backend matches` : ""}.
                  {listScopeCopy ? ` ${listScopeCopy}` : ""}
                </p>
              </div>
              <div className="list-metadata">
                <span className="list-meta-pill">schema: {dataset.tableName}</span>
                <span className="list-meta-pill">records: {records.length}</span>
              </div>
            </div>

            {listLoading ? (
              <StatusPanel
                tone="default"
                title="Loading data"
                description={listLoadingCopy}
              />
            ) : null}

            {listError ? (
              <StatusPanel
                tone="error"
                title="List request failed"
                description={listError}
                actionLabel={onRetryList ? "Retry" : undefined}
                onAction={onRetryList}
              />
            ) : null}

            {!listLoading && !listError && !records.length ? (
              <StatusPanel tone="empty" title="No records" description={listEmptyCopy} />
            ) : null}

            {records.length ? (
              <div className="table-scroll">
                <table className="record-table">
                  <thead>
                    <tr>
                      {dataset.columns.map((column) => (
                        <th key={column.key}>{column.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => {
                      const isSelected = String(record.id) === String(selectedRecord?.id);

                      return (
                        <tr
                          key={String(record.id)}
                          className={isSelected ? "selected" : undefined}
                          onClick={() => onSelect(String(record.id))}
                        >
                          {dataset.columns.map((column) => {
                            const value = record[column.key];
                            const tone = getAdminTone(column.key, value);

                            return (
                              <td key={`${record.id}-${column.key}`}>
                                <span className={`table-value tone-${tone}`}>
                                  {formatAdminValue(value)}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}
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
                  The drawer keeps the current list/detail interaction intact while the page reads
                  from live backend responses.
                </p>
              </div>
              <div className="detail-action-row">
                <button type="button" className="mini-action accent">
                  manual revision
                </button>
                <button type="button" className="mini-action">
                  import mapping
                </button>
              </div>
            </div>

            {detailLoading ? (
              <StatusPanel
                tone="default"
                title="Loading detail"
                description={detailLoadingCopy}
              />
            ) : null}

            {detailError ? (
              <StatusPanel
                tone="error"
                title="Detail request failed"
                description={detailError}
                actionLabel={onRetryDetail ? "Retry" : undefined}
                onAction={onRetryDetail}
              />
            ) : null}

            {!detailLoading && !detailError && drawerRecord ? (
              <div className="detail-section-stack">
                {dataset.detailSections.map((section) => (
                  <section key={section.title} className="detail-section-card">
                    <div className="detail-section-head">
                      <h4>{section.title}</h4>
                      <p>{section.description}</p>
                    </div>

                    <div className="detail-form-grid">
                      {section.fields.map((fieldKey) => {
                        const field = getAdminField(dataset.fields, fieldKey);

                        if (!field) {
                          return null;
                        }

                        const value = formatAdminValue(drawerRecord[field.key]);

                        return (
                          <label key={field.key} className="detail-field">
                            <span className="detail-field-top">
                              <strong>{field.label}</strong>
                              <em>{field.type}</em>
                            </span>
                            {field.type === "text" ? (
                              <textarea readOnly value={value} rows={4} />
                            ) : (
                              <input readOnly value={value} />
                            )}
                            <span className="detail-field-help">
                              {field.required ? "required" : "optional"} / {field.description}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            ) : null}

            {!detailLoading && !detailError && !drawerRecord ? (
              <div className="empty-drawer">
                <p>{detailEmptyCopy}</p>
              </div>
            ) : null}
          </aside>
        </div>
      </section>
    </div>
  );
}
