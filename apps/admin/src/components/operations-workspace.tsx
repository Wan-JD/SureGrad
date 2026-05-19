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

const hiddenFieldKeys = new Set(["id", "school_id", "department_id", "program_id"]);

const businessLabelMap: Record<string, string> = {
  id: "内部标识",
  name: "名称",
  short_name: "简称",
  code: "代码",
  school_id: "所属院校",
  department_id: "所属院系",
  program_id: "关联专业",
  province: "省份",
  city: "城市",
  school_type: "院校类型",
  school_level: "院校层级",
  has_graduate_school: "设有研究生院",
  official_website: "学校官网",
  graduate_website: "研究生院官网",
  description: "说明",
  sort_order: "排序",
  status: "状态",
  created_at: "创建时间",
  updated_at: "更新时间",
  deleted_at: "删除时间",
  website: "官网链接",
  degree_type: "学位类型",
  discipline_category: "学科门类",
  research_direction: "研究方向",
  exam_math_required: "是否考数学",
  duration_years: "学制",
  tuition_per_year: "年学费",
  notes: "备注",
  exam_year: "年份",
  planned_enrollment: "计划招生",
  recommended_exemption_count: "推免人数",
  unified_exam_quota: "统考名额",
  actual_enrollment: "实际录取",
  is_cross_major_allowed: "允许跨考",
  source_confidence: "来源可信度",
  total_score: "总分线",
  politics_score: "政治线",
  english_score: "英语线",
  subject_one_score: "专业课一",
  subject_two_score: "专业课二",
  score_line_type: "分数线类型",
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
  subject: "科目",
  stage: "适用阶段",
  source_type: "来源类型",
  publisher_name: "发布主体",
  published_at: "发布时间",
  last_verified_at: "最近复核",
  title: "标题",
  url: "链接地址",
  resource_type: "资料类型",
  difficulty_level: "难度等级",
  format: "内容形式",
  price_type: "价格类型",
  featured_rank: "推荐排序",
  summary: "推荐语",
  provider_name: "提供方",
  landing_url: "跳转链接",
  departments: "院系列表",
  program_admissions: "招生计划",
  program_score_lines: "分数线",
  program_application_stats: "报录比",
  program_interview_stats: "复录比",
  study_resources: "资料推荐",
  program_source_links: "来源链接",
  stage_tag: "学习阶段",
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

const idAliasMap: Record<string, string> = {
  "2ef8a770-5135-4354-b1db-6f0caef25011": "华东理工大学",
  "ab523499-7de0-44ab-b27b-d880c8265080": "上海财经大学",
  "c98ef6cd-e3a0-483d-a06f-aa1bf717b821": "华南师范大学",
  "f14bb7b9-5fb7-4365-bc49-70a7d2f2386f": "信息科学与工程学院",
  "acfc94ba-8c88-4c6e-9106-76f578f8cc4d": "金融学院",
  "2a683623-8fe9-471f-8faa-747ad5f54c92": "教育科学学院",
  "ea7c3729-1315-4cf0-a7e8-39216b030f2e": "计算机科学与技术",
  "5d9121e3-0b80-40e9-8d4e-d7678df8cf0a": "金融",
  "7bc0ea91-26eb-4229-9508-c2f77ec2e157": "应用心理",
};

function getBusinessLabel(label: string): string {
  return businessLabelMap[label] ?? label;
}

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
    return "未提供";
  }

  if (typeof value === "boolean") {
    return value ? "是" : "否";
  }

  const text = String(value);

  if (idAliasMap[text]) return idAliasMap[text];

  if (text === "active") return "启用中";
  if (text === "inactive") return "未启用";
  if (text === "pending") return "待复核";
  if (text === "invalid") return "已失效";
  if (text === "draft") return "草稿";
  if (text === "archived") return "已归档";
  if (text === "official") return "官方";
  if (text === "estimated") return "估算";
  if (text === "manual") return "人工补录";
  if (text === "academic") return "学硕";
  if (text === "professional") return "专硕";
  if (text === "foundation") return "基础阶段";
  if (text === "intensive") return "强化阶段";
  if (text === "sprint") return "冲刺阶段";
  if (text === "brochure") return "招生简章";
  if (text === "official_notice") return "官方通知";
  if (text === "retest_rule") return "复试细则";
  if (text === "national_a") return "国家线 A 类";
  if (text === "school") return "院校线";
  if (text === "retest") return "复试线";

  return text;
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
  const visibleFieldCount = activeDataset.fields.filter((field) => !hiddenFieldKeys.has(field.key)).length;
  const selectedTitle = selectedRecord
    ? getPrimaryLabel(selectedRecord, activeDataset.tableName)
    : getBusinessLabel(activeDataset.title);
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
            <span className="hero-stat-label">覆盖模块</span>
            <strong>{page.relatedTables.length} 个运营对象</strong>
          </div>
          <div className="hero-stat-card">
            <span className="hero-stat-label">导入模板</span>
            <strong>{activeDataset.templateName}</strong>
          </div>
          <div className="hero-stat-card">
            <span className="hero-stat-label">展示字段</span>
            <strong>
              {visibleFieldCount} 项可读字段 / {requiredFieldCount} 项必填
            </strong>
          </div>
        </div>
      </section>

      {page.datasets.length > 1 ? (
        <section className="section-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">年份页签</span>
              <h2>年份子表切换</h2>
            </div>
            <p>统一入口下切换四类年度数据，方便按主题查看招生计划、分数线、报录比和复录比。</p>
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
                  <span className="dataset-tab-title">{getBusinessLabel(dataset.title)}</span>
                  <span className="dataset-tab-copy">{dataset.description}</span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="workspace-summary-grid">
        <article className="insight-card">
          <span className="eyebrow">范围</span>
          <h3>{getBusinessLabel(activeDataset.title)}</h3>
          <p>{activeDataset.description}</p>
          <ul className="tag-list">
            <li>模板: {activeDataset.templateName}</li>
            <li>可读字段: {visibleFieldCount}</li>
            <li>样例记录: {activeDataset.records.length}</li>
          </ul>
        </article>

        <article className="insight-card">
          <span className="eyebrow">导入</span>
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
          <span className="eyebrow">核对</span>
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
            <span className="eyebrow">筛选</span>
            <h2>列表与筛选</h2>
          </div>
          <p>搜索、筛选和样例结果数都围绕运营动作展开，方便先定位信息，再决定导入、核验或人工修订。</p>
        </div>

        <div className="filter-toolbar">
          <label className="filter-field filter-search">
            <span>搜索</span>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={`搜索 ${activeDataset.title} 当前样例`}
            />
          </label>

          {activeDataset.filters.map((filter) => (
            <label key={filter.key} className="filter-field">
                <span>{getBusinessLabel(filter.label)}</span>
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
                    {getBusinessLabel(option.label)}
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
                <h3>{getBusinessLabel(activeDataset.title)}列表</h3>
                <p>
                  筛选后共 {filteredRecords.length} 条样例记录，当前布局用于说明该模块的展示重点与后续录入方式。
                </p>
              </div>
              <div className="list-metadata">
                <span className="list-meta-pill">模块: {page.title}</span>
                <span className="list-meta-pill">结果数: {filteredRecords.length}</span>
              </div>
            </div>

            <div className="table-scroll">
              <table className="record-table">
                <thead>
                  <tr>
                    {activeDataset.columns.map((column) => (
                      <th key={column.key}>{getBusinessLabel(column.label)}</th>
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
                  详情区用统一样式承接字段说明，方便运营对照状态、来源、备注与时间信息完成核验。
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
                        if (hiddenFieldKeys.has(fieldKey)) {
                          return null;
                        }

                        const field = getField(activeDataset, fieldKey);

                        if (!field) {
                          return null;
                        }

                        return (
                          <label key={field.key} className="detail-field">
                            <span className="detail-field-top">
                              <strong>{getBusinessLabel(field.label)}</strong>
                              <em>{field.required ? "必填" : "选填"}</em>
                            </span>
                            {field.type === "text" ? (
                              <textarea readOnly value={formatValue(selectedRecord[field.key])} rows={3} />
                            ) : (
                              <input readOnly value={formatValue(selectedRecord[field.key])} />
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
