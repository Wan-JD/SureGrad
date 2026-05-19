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

const hiddenFieldKeys = new Set(["id", "school_id", "department_id", "program_id"]);

const businessLabelMap: Record<string, string> = {
  name: "名称",
  short_name: "简称",
  code: "代码",
  province: "省份",
  city: "城市",
  school_level: "院校层级",
  school_type: "院校类型",
  matched_programs: "关联专业",
  score_line_summary: "分数线概览",
  application_ratio_summary: "报录比概览",
  interview_ratio_summary: "复录比概览",
  schools: "学校档案",
  programs: "专业清单",
  departments: "院系列表",
  program_admissions: "招生计划",
  program_score_lines: "分数线",
  program_application_stats: "报录比",
  program_interview_stats: "复录比",
  study_resources: "资料推荐",
  program_source_links: "来源链接",
  has_graduate_school: "设有研究生院",
  official_website: "学校官网",
  graduate_website: "研究生院官网",
  description: "说明",
  program_count: "专业数量",
  hot_programs: "重点专业",
  school_name: "院校名称",
  department_name: "院系名称",
  degree_type: "学位类型",
  discipline_category: "学科门类",
  research_direction: "研究方向",
  is_favorited: "已被用户收藏",
  is_in_comparison: "已进入用户对比",
  status: "状态",
  exam_year: "年份",
  updated_at: "更新时间",
  created_at: "创建时间",
  deleted_at: "删除时间",
  source_type: "来源类型",
  source_confidence: "来源可信度",
  title: "标题",
  subject: "科目",
  stage: "适用阶段",
  last_verified_at: "最近复核",
  publisher_name: "发布主体",
  published_at: "发布时间",
  url: "链接地址",
  notes: "备注",
  resource_type: "资料类型",
  difficulty_level: "难度等级",
  format: "内容形式",
  price_type: "价格类型",
  featured_rank: "推荐排序",
  summary: "推荐语",
  provider_name: "提供方",
  landing_url: "跳转链接",
  planned_enrollment: "计划招生",
  actual_enrollment: "实际录取",
  recommended_exemption_count: "推免人数",
  unified_exam_quota: "统考名额",
  is_cross_major_allowed: "允许跨考",
  total_score: "总分线",
  politics_score: "政治线",
  english_score: "英语线",
  subject_one_score: "专业课一",
  subject_two_score: "专业课二",
  applicant_count: "报名人数",
  actual_exam_count: "实考人数",
  admitted_count: "录取人数",
  application_ratio: "报录比",
  retest_candidate_count: "复试人数",
  final_admitted_count: "最终录取",
  interview_ratio: "复录比",
  retest_weight: "复试权重",
  initial_exam_weight: "初试权重",
  memo: "补充说明",
  missing_flags: "待补数据",
  active: "启用中",
  inactive: "未启用",
  pending: "待复核",
  invalid: "已失效",
  draft: "草稿",
  archived: "已归档",
  academic: "学硕",
  professional: "专硕",
  foundation: "基础阶段",
  intensive: "强化阶段",
  sprint: "冲刺阶段",
  brochure: "招生简章",
  official_notice: "官方通知",
  retest_rule: "复试细则",
  official: "官方",
  estimated: "估算",
  manual: "人工补录",
  book: "图书",
  course: "课程",
  question_bank: "题库",
  article: "文章",
  text: "图文",
  video: "视频",
  mixed: "混合内容",
  free: "免费",
  paid: "付费",
  true: "是",
  false: "否",
  null: "未提供",
  NULL: "未提供",
};

function getBusinessLabel(label: string): string {
  return businessLabelMap[label] ?? label;
}

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
  const visibleFieldCount = dataset.fields.filter((field) => !hiddenFieldKeys.has(field.key)).length;
  const selectedRecord = records.find((record) => String(record.id) === selectedId) ?? records[0] ?? null;
  const drawerRecord = detailRecord ?? selectedRecord;
  const selectedTitle = drawerRecord
    ? getAdminPrimaryLabel(drawerRecord, dataset.tableName)
    : getBusinessLabel(dataset.title);
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
            <span className="hero-stat-label">覆盖模块</span>
            <strong>{page.relatedTables.length} 个运营对象</strong>
          </div>
          <div className="hero-stat-card">
            <span className="hero-stat-label">导入模板</span>
            <strong>{dataset.templateName}</strong>
          </div>
          <div className="hero-stat-card">
            <span className="hero-stat-label">展示字段</span>
            <strong>
              {visibleFieldCount} 项可读字段 / {requiredFieldCount} 项必填
            </strong>
          </div>
        </div>
      </section>

      <section className="workspace-summary-grid">
        <article className="insight-card">
          <span className="eyebrow">范围</span>
          <h3>{getBusinessLabel(dataset.title)}</h3>
          <p>{dataset.description}</p>
          <ul className="tag-list">
            <li>导入模板: {dataset.templateName}</li>
            <li>可读字段: {visibleFieldCount}</li>
            <li>当前结果: {records.length}</li>
          </ul>
        </article>

        <article className="insight-card">
          <span className="eyebrow">导入</span>
          <h3>批量导入入口</h3>
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
          <span className="eyebrow">核对</span>
          <h3>人工核对入口</h3>
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
            <span className="eyebrow">筛选</span>
            <h2>列表与详情查看</h2>
          </div>
          <p>
            真实数据已经接入当前列表与详情区，加载中、空态和错误态都在同一工作台内完成反馈。
          </p>
        </div>

        <div className="filter-toolbar">
          <label className="filter-field filter-search">
            <span>{search.label ?? "搜索"}</span>
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
              <span>{getBusinessLabel(filter.label)}</span>
              <select
                value={filter.value}
                onChange={(event) => filter.onChange(event.target.value)}
                disabled={filter.disabled}
              >
                {filter.options.map((option) => (
                  <option key={`${filter.key}-${option.value}`} value={option.value}>
                    {getBusinessLabel(option.label)}
                  </option>
                ))}
              </select>
            </label>
          ))}

          <button type="button" className="toolbar-reset" onClick={onResetFilters}>
            清空筛选
          </button>
        </div>

        <div className="workspace-main-grid">
          <div className="record-list-panel">
            <div className="list-header">
              <div>
                <h3>{getBusinessLabel(dataset.title)}列表</h3>
                <p>
                  当前展示 {records.length} 条结果
                  {totalRecords > records.length ? `，后端共匹配 ${totalRecords} 条` : ""}。
                  {listScopeCopy ? ` ${listScopeCopy}` : ""}
                </p>
              </div>
              <div className="list-metadata">
                <span className="list-meta-pill">模块: {page.title}</span>
                <span className="list-meta-pill">结果数: {records.length}</span>
              </div>
            </div>

            {listLoading ? (
              <StatusPanel
                tone="default"
                title="正在加载数据"
                description={listLoadingCopy}
              />
            ) : null}

            {listError ? (
              <StatusPanel
                tone="error"
                title="列表加载失败"
                description={listError}
                actionLabel={onRetryList ? "重试" : undefined}
                onAction={onRetryList}
              />
            ) : null}

            {!listLoading && !listError && !records.length ? (
              <StatusPanel tone="empty" title="暂无结果" description={listEmptyCopy} />
            ) : null}

            {records.length ? (
              <div className="table-scroll">
                <table className="record-table">
                  <thead>
                    <tr>
                      {dataset.columns.map((column) => (
                        <th key={column.key}>{getBusinessLabel(column.label)}</th>
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
                <span className="eyebrow">详情</span>
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
                  详情区保留当前“列表联动查看”的方式，方便运营快速判断资料是否完整、是否需要修订。
                </p>
              </div>
              <div className="detail-action-row">
                <button type="button" className="mini-action accent">
                  人工修订
                </button>
                <button type="button" className="mini-action">
                  导入映射
                </button>
              </div>
            </div>

            {detailLoading ? (
              <StatusPanel
                tone="default"
                title="正在加载详情"
                description={detailLoadingCopy}
              />
            ) : null}

            {detailError ? (
              <StatusPanel
                tone="error"
                title="详情加载失败"
                description={detailError}
                actionLabel={onRetryDetail ? "重试" : undefined}
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
                        if (hiddenFieldKeys.has(fieldKey)) {
                          return null;
                        }

                        const field = getAdminField(dataset.fields, fieldKey);

                        if (!field) {
                          return null;
                        }

                        const value = formatAdminValue(drawerRecord[field.key]);

                        return (
                          <label key={field.key} className="detail-field">
                            <span className="detail-field-top">
                              <strong>{getBusinessLabel(field.label)}</strong>
                              <em>{field.required ? "必填" : "选填"}</em>
                            </span>
                            {field.type === "text" ? (
                              <textarea readOnly value={value} rows={4} />
                            ) : (
                              <input readOnly value={value} />
                            )}
                            <span className="detail-field-help">
                              {field.description}
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
