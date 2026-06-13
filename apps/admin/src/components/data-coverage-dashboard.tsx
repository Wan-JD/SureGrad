"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getAdminDataCoverageSummary,
  type AdminDataCoverageSummary,
} from "@/lib/admin-live-data";

type CoverageState = {
  data: AdminDataCoverageSummary | null;
  loading: boolean;
  error: string | null;
};

type Metric = {
  label: string;
  value: number;
  total?: number;
  tone?: "default" | "warn" | "ok";
};

type ProgramYearlyGap =
  AdminDataCoverageSummary["priorityGaps"]["programYearlyGaps"][number];

function formatPercent(value: number, total: number) {
  if (total <= 0) {
    return "0%";
  }

  const percent = (value / total) * 100;
  return percent % 1 === 0 ? `${percent}%` : `${percent.toFixed(1)}%`;
}

function MetricCard({ metric }: { metric: Metric }) {
  const percent =
    metric.total === undefined
      ? null
      : formatPercent(metric.value, metric.total);

  return (
    <article className={`coverage-metric ${metric.tone ?? "default"}`}>
      <span>{metric.label}</span>
      <strong>{metric.value}</strong>
      {percent ? <small>{percent}</small> : null}
    </article>
  );
}

function formatProgramGapLabels(gap: ProgramYearlyGap) {
  const labels = [
    gap.missingAdmissions ? "招生" : null,
    gap.missingScoreLines ? "分数线" : null,
    gap.missingApplicationStats ? "报录比" : null,
    gap.missingInterviewStats ? "复试" : null,
    gap.missingExamSubjects ? "初试科目" : null,
    gap.missingReferenceBooks ? "参考书" : null,
  ].filter(Boolean);

  return labels.length ? labels.join("、") : "年度数据已齐";
}

export function DataCoverageDashboard() {
  const [state, setState] = useState<CoverageState>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    setState((current) => ({ ...current, loading: true, error: null }));
    void getAdminDataCoverageSummary(controller.signal)
      .then((data) => {
        setState({ data, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setState({
          data: null,
          loading: false,
          error:
            error instanceof Error ? error.message : "无法读取数据库覆盖缺口。",
        });
      });

    return () => controller.abort();
  }, []);

  const schoolMetrics = useMemo<Metric[]>(() => {
    const schools = state.data?.schools;
    if (!schools) {
      return [];
    }

    return [
      {
        label: "学校总量",
        value: schools.total,
      },
      {
        label: "缺官网",
        value: schools.missingOfficialWebsite,
        total: schools.total,
        tone: schools.missingOfficialWebsite > 0 ? "warn" : "ok",
      },
      {
        label: "缺研究生院",
        value: schools.missingGraduateWebsite,
        total: schools.total,
        tone: schools.missingGraduateWebsite > 0 ? "warn" : "ok",
      },
      {
        label: "类型未分类",
        value: schools.unclassifiedSchoolType,
        total: schools.total,
        tone: schools.unclassifiedSchoolType > 0 ? "warn" : "ok",
      },
      {
        label: "无专业",
        value: schools.withoutPrograms,
        total: schools.total,
        tone: schools.withoutPrograms > 0 ? "warn" : "ok",
      },
    ];
  }, [state.data]);

  const programMetrics = useMemo<Metric[]>(() => {
    const programs = state.data?.programs;
    if (!programs) {
      return [];
    }

    return [
      {
        label: "专业总量",
        value: programs.total,
      },
      {
        label: "缺来源链接",
        value: programs.withoutSourceLinks,
        total: programs.total,
        tone: programs.withoutSourceLinks > 0 ? "warn" : "ok",
      },
      {
        label: "缺招生计划",
        value: programs.withoutAdmissions,
        total: programs.total,
        tone: programs.withoutAdmissions > 0 ? "warn" : "ok",
      },
      {
        label: "缺分数线",
        value: programs.withoutScoreLines,
        total: programs.total,
        tone: programs.withoutScoreLines > 0 ? "warn" : "ok",
      },
      {
        label: "缺报录比",
        value: programs.withoutApplicationStats,
        total: programs.total,
        tone: programs.withoutApplicationStats > 0 ? "warn" : "ok",
      },
      {
        label: "缺复试统计",
        value: programs.withoutInterviewStats,
        total: programs.total,
        tone: programs.withoutInterviewStats > 0 ? "warn" : "ok",
      },
      {
        label: "缺初试科目",
        value: programs.withoutExamSubjects,
        total: programs.total,
        tone: programs.withoutExamSubjects > 0 ? "warn" : "ok",
      },
      {
        label: "缺参考书",
        value: programs.withoutReferenceBooks,
        total: programs.total,
        tone: programs.withoutReferenceBooks > 0 ? "warn" : "ok",
      },
    ];
  }, [state.data]);

  const yearlyRecords = state.data?.yearlyRecords;
  const sourceLinks = state.data?.sourceLinks;
  const priorityGaps = state.data?.priorityGaps;

  return (
    <section className="section-card coverage-dashboard">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Database Coverage</span>
          <h2>数据库覆盖缺口</h2>
        </div>
        <p>
          这里直接读取后端数据库聚合结果，只展示已经能被库表验证的字段覆盖率，作为下一轮官方补数的优先清单。
        </p>
      </div>

      {state.loading ? (
        <div className="coverage-placeholder">正在读取数据库覆盖缺口。</div>
      ) : state.error ? (
        <div className="coverage-placeholder warn">{state.error}</div>
      ) : state.data ? (
        <>
          <div className="coverage-grid">
            {schoolMetrics.map((metric) => (
              <MetricCard key={metric.label} metric={metric} />
            ))}
          </div>
          <div className="coverage-grid programs">
            {programMetrics.map((metric) => (
              <MetricCard key={metric.label} metric={metric} />
            ))}
          </div>
          {priorityGaps ? (
            <div className="coverage-priority-grid">
              <article className="coverage-priority-panel">
                <div className="coverage-priority-head">
                  <span>官网缺口省份</span>
                  <strong>{priorityGaps.provinceWebsiteGaps.length}</strong>
                </div>
                {priorityGaps.provinceWebsiteGaps.length ? (
                  <ul className="coverage-priority-list">
                    {priorityGaps.provinceWebsiteGaps.map((item) => (
                      <li key={item.province}>
                        <div>
                          <strong>{item.province}</strong>
                          <small>{item.total} 所学校</small>
                        </div>
                        <span>
                          双缺 {item.missingBothWebsites} / 官网{" "}
                          {item.missingOfficialWebsite} / 研招{" "}
                          {item.missingGraduateWebsite}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="coverage-empty-copy">暂无省份级官网缺口。</p>
                )}
              </article>

              <article className="coverage-priority-panel">
                <div className="coverage-priority-head">
                  <span>学校入口队列</span>
                  <strong>{priorityGaps.schoolWebsiteGaps.length}</strong>
                </div>
                {priorityGaps.schoolWebsiteGaps.length ? (
                  <ul className="coverage-priority-list">
                    {priorityGaps.schoolWebsiteGaps.map((item) => {
                      const missing = [
                        item.missingOfficialWebsite ? "官网" : null,
                        item.missingGraduateWebsite ? "研招入口" : null,
                      ]
                        .filter(Boolean)
                        .join("、");

                      return (
                        <li key={item.schoolId}>
                          <div>
                            <strong>{item.schoolName}</strong>
                            <small>
                              {item.province} · {item.city} ·{" "}
                              {item.schoolLevel}
                            </small>
                          </div>
                          <span>
                            缺 {missing || "无"} · 已接专业{" "}
                            {item.programCount}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="coverage-empty-copy">暂无学校入口缺口。</p>
                )}
              </article>

              <article className="coverage-priority-panel wide">
                <div className="coverage-priority-head">
                  <span>专业年度缺口</span>
                  <strong>{priorityGaps.programYearlyGaps.length}</strong>
                </div>
                {priorityGaps.programYearlyGaps.length ? (
                  <ul className="coverage-priority-list compact">
                    {priorityGaps.programYearlyGaps.map((item) => (
                      <li key={item.programId}>
                        <div>
                          <strong>
                            {item.schoolName} · {item.programName}
                          </strong>
                          <small>
                            {item.departmentName} · {item.programCode} ·{" "}
                            {item.latestExamYear ?? "年份待补"}
                          </small>
                        </div>
                        <span>
                          缺 {item.missingCount} 项：{formatProgramGapLabels(item)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="coverage-empty-copy">暂无专业年度缺口。</p>
                )}
              </article>
            </div>
          ) : null}
          <div className="coverage-footer">
            <span>
              来源链接 {sourceLinks?.total ?? 0} 条，其中 official{" "}
              {sourceLinks?.official ?? 0} 条。
            </span>
            <span>
              年度记录：招生 {yearlyRecords?.admissions ?? 0}，分数线{" "}
              {yearlyRecords?.scoreLines ?? 0}，报录比{" "}
              {yearlyRecords?.applicationStats ?? 0}，复试{" "}
              {yearlyRecords?.interviewStats ?? 0}，初试科目{" "}
              {yearlyRecords?.examSubjects ?? 0}，参考书{" "}
              {yearlyRecords?.referenceBooks ?? 0}。
            </span>
          </div>
        </>
      ) : null}
    </section>
  );
}
