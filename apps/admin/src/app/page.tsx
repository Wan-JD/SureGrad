import Link from "next/link";
import { BatchMissingTemplates, CollectedBatchGapsBanner } from "@/components/batch-missing-templates";
import { adminNavigation } from "@/config/admin-navigation";
import { getCollectedImportBatches } from "@/lib/collected-import-batches";

const focusAreas = [
  {
    title: "主数据链路",
    description:
      "围绕学校、院系、专业和年度数据组织运营流程，让从院校到专业的数据链路在同一后台里连续可查。",
    points: ["学校档案", "院系归属", "专业信息", "年度数据"],
  },
  {
    title: "推荐与追溯",
    description:
      "把资料推荐和来源链接同时纳入运营工作台，既能维护推荐清单，也能给前台内容保留明确的出处与复核节奏。",
    points: ["资料推荐", "来源链接", "科目标记", "阶段标签"],
  },
  {
    title: "交付形态",
    description:
      "这一版先把信息架构、筛选流程、只读详情和导入修订入口统一起来，保证演示与后续接 API 时都沿用同一套页面骨架。",
    points: ["静态筛选", "列表结构", "详情抽屉", "导入 / 修订入口"],
  },
];

const workflowSteps = [
  {
    index: "01",
    title: "学校与院系",
    description:
      "先维护学校基础档案和院系从属关系，保证后续 programs 的外键映射、导入定位和筛选维度完整。",
  },
  {
    index: "02",
    title: "专业与年份数据",
    description:
      "以具体招生专业为粒度承接主表与年份子表，让专业信息、分数线、报录比和复试统计能串成完整运营链路。",
  },
  {
    index: "03",
    title: "资料与来源",
    description:
      "在推荐资料和来源链接两类页面里分别治理学习资源与信息出处，方便前台展示推荐内容时同步保留可追溯性。",
  },
];

export default async function Home() {
  const collectedBatches = await getCollectedImportBatches();
  const collectedStats = collectedBatches.reduce(
    (summary, batch) => {
      summary.batches += 1;
      summary.schools += batch.counts.schools;
      summary.programs += batch.counts.programs;
      summary.sourceLinks += batch.counts.sourceLinks;
      summary.scoreLines += batch.counts.scoreLines;
      summary.admissions += batch.counts.admissions;
      summary.examSubjects += batch.counts.examSubjects;

      for (const year of batch.years) {
        summary.years.add(year);
      }

      summary.missingCsv += batch.missingTemplates.length;

      return summary;
    },
    {
      batches: 0,
      schools: 0,
      programs: 0,
      sourceLinks: 0,
      scoreLines: 0,
      admissions: 0,
      examSubjects: 0,
      missingCsv: 0,
      years: new Set<number>(),
    },
  );
  const batchesNeedingCsv = collectedBatches.filter((batch) => batch.missingTemplates.length > 0).length;

  return (
    <div className="page-stack">
      <section className="hero-card home-hero">
        <div className="home-hero-copy">
          <span className="eyebrow">SureGrad Admin</span>
          <h1>SureGrad 运营后台工作台</h1>
          <p className="hero-copy">
            当前首页不只承接导航，也把六类核心运营页面放到同一张地图里。学校、院系、专业、年份数据、资料推荐和来源链接
            共享统一的工作台骨架，方便运营同学按同一种方式查看列表、理解信息并逐步接入真实数据。
          </p>
          <div className="hero-chip-row">
            <span className="hero-chip">工作台页面: 6</span>
            <span className="hero-chip">主链路: 学校 -&gt; 院系 -&gt; 专业</span>
            <span className="hero-chip">年份页签: 4</span>
          </div>
        </div>
        <div className="home-hero-side">
          <div className="home-hero-card">
            <span className="eyebrow">Operations</span>
            <h3>统一列表、筛选与详情</h3>
            <p>每个模块都沿用相同的筛选栏、列表和只读详情布局，演示时可以稳定说明运营动作与后续接入方式。</p>
          </div>
          <div className="home-hero-card muted">
            <span className="eyebrow">Coverage</span>
            <h3>资料推荐与来源治理并行</h3>
            <p>资料推荐页现在和来源链接页并列纳入工作台，既能展示推荐清单，也能说明与科目、阶段和状态治理的关系。</p>
          </div>
        </div>
      </section>

      <section className="section-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Modules</span>
            <h2>核心运营入口</h2>
          </div>
          <p>首页把六类模块统一展开，进入后台时可以直接从业务视角选择入口，不需要再区分哪些页面属于占位态。</p>
        </div>
        <div className="module-grid">
          {adminNavigation.map((item) => (
            <Link key={item.href} href={item.href} className="module-card">
              <div className="module-card-top">
                <span className="module-icon">{item.shortLabel}</span>
                <span className="status-pill">可演示</span>
              </div>
              <h3>{item.label}</h3>
              <p>{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Collected</span>
            <h2>真实采集批次概览</h2>
          </div>
          <p>首页直接读取 `tools/data-import/collected`，让运营一眼看到每个真实批次还缺哪些 CSV 才能进入完整校验。</p>
        </div>
        <CollectedBatchGapsBanner
          batches={collectedBatches}
          title="待补 CSV 清单"
          description="按学校/年份批次列出仍缺的导入模板。业务名称用于指导补数，文件名仅供放入批次目录时对照。"
        />
        <div className="summary-strip">
          <article className="summary-chip">
            <strong>{collectedStats.batches}</strong>
            <span>采集批次</span>
          </article>
          <article className="summary-chip">
            <strong>{collectedStats.schools}</strong>
            <span>学校条目</span>
          </article>
          <article className="summary-chip">
            <strong>{collectedStats.programs}</strong>
            <span>专业条目</span>
          </article>
          <article className="summary-chip">
            <strong>{collectedStats.sourceLinks}</strong>
            <span>来源链接</span>
          </article>
          <article className="summary-chip">
            <strong>{collectedStats.scoreLines}</strong>
            <span>分数线记录</span>
          </article>
          <article className="summary-chip">
            <strong>{collectedStats.admissions}</strong>
            <span>招生计划</span>
          </article>
          <article className="summary-chip">
            <strong>{collectedStats.examSubjects}</strong>
            <span>初试科目</span>
          </article>
          <article className="summary-chip">
            <strong>{collectedStats.years.size}</strong>
            <span>覆盖年份</span>
          </article>
          <article className="summary-chip">
            <strong>{collectedStats.missingCsv}</strong>
            <span>待补 CSV</span>
          </article>
          <article className="summary-chip">
            <strong>{batchesNeedingCsv}</strong>
            <span>待补批次</span>
          </article>
        </div>
        <div className="collected-grid">
          {collectedBatches.map((batch) => (
            <article key={batch.id} className="collected-card">
              <div className="collected-card-top">
                <div>
                  <span className="eyebrow">Batch</span>
                  <h3>{batch.title}</h3>
                </div>
                <span className="status-pill">{batch.collectedAt ?? "未标注日期"}</span>
              </div>
              <p className="collected-copy">
                学校 {batch.counts.schools} 条，专业 {batch.counts.programs} 条，来源链接 {batch.counts.sourceLinks} 条，分数线
                {batch.counts.scoreLines} 条。
              </p>
              <div className="hero-chip-row">
                <span className="hero-chip">年份: {batch.years.join(" / ") || "待补"}</span>
                <span className="hero-chip">已放入: {batch.csvFiles.length} 份 CSV</span>
                {batch.missingTemplates.length > 0 ? (
                  <span className="hero-chip warn">待补 {batch.missingTemplates.length} 份</span>
                ) : (
                  <span className="hero-chip ok">模板已齐</span>
                )}
              </div>
              <BatchMissingTemplates batch={batch} />
              <div className="collected-actions">
                <Link href="/source-links" className="module-card collected-action">
                  查看来源治理
                </Link>
                <Link href="/yearly-data" className="module-card collected-action">
                  查看年份数据
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="three-column-grid">
        {focusAreas.map((item) => (
          <article key={item.title} className="insight-card">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <ul className="tag-list">
              {item.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="section-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Flow</span>
            <h2>运营工作流视角</h2>
          </div>
          <p>首页同时说明数据链路和运营动作，减少进入各页后重新理解模块边界的成本。</p>
        </div>
        <div className="home-rail-grid">
          {workflowSteps.map((item) => (
            <article key={item.index} className="rail-card">
              <span className="rail-index">{item.index}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
