import Link from "next/link";
import { adminNavigation } from "@/config/admin-navigation";

const deliveredModules = adminNavigation.filter((item) => item.href !== "/resources");
const reservedModules = adminNavigation.filter((item) => item.href === "/resources");

const focusAreas = [
  {
    title: "择校主链路数据",
    description:
      "围绕 schools、departments、programs 和挂接其上的年份子表，承接 SureGrad MVP 最核心的数据治理工作。",
    points: ["schools", "departments", "programs", "program_* 年份表"],
  },
  {
    title: "资料与来源治理",
    description:
      "优先满足资料推荐和来源追溯，确保后台录入的信息在前台始终保留可追溯能力。",
    points: ["study_resources", "program_source_links", "subjects", "books"],
  },
  {
    title: "当前实现边界",
    description:
      "本轮先完成运营页结构、筛选和详情抽屉，不接真实接口，也不处理权限和提交动作。",
    points: ["静态筛选", "列表结构", "详情抽屉", "导入/修订入口"],
  },
];

export default function Home() {
  return (
    <div className="page-stack">
      <section className="hero-card home-hero">
        <div className="home-hero-copy">
          <span className="eyebrow">SureGrad Admin</span>
          <h1>SureGrad 运营后台首批交付</h1>
          <p className="hero-copy">
            本轮聚焦学校、院系、专业、年份数据和来源链接五类核心运营页，先把筛选、列表、详情区、
            schema 字段口径以及导入修订入口统一起来，让运营同学可以直接基于这套骨架继续接真实数据。
          </p>
          <div className="hero-chip-row">
            <span className="hero-chip">交付页: 6</span>
            <span className="hero-chip">核心表: schools → departments → programs</span>
            <span className="hero-chip">年份子表: 4</span>
          </div>
        </div>
        <div className="home-hero-side">
          <div className="home-hero-card">
            <span className="eyebrow">This Round</span>
            <h3>运营主链路先可用</h3>
            <p>先保证录入主链路可巡检、可扩展、可挂接导入，不把时间摊到新模块上。</p>
          </div>
          <div className="home-hero-card muted">
            <span className="eyebrow">Reserved</span>
            <h3>资料页明确降级</h3>
            <p>`resources` 保持预留态，不和已交付运营页混写，避免验收口径模糊。</p>
          </div>
        </div>
      </section>

      <section className="section-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Modules</span>
            <h2>本轮交付入口</h2>
          </div>
          <p>把已交付页和预留页拆开呈现，运营同学进后台时能第一眼知道哪些页面可以直接使用。</p>
        </div>
        <div className="module-grid">
          {deliveredModules.map((item) => (
            <Link key={item.href} href={item.href} className="module-card">
              <div className="module-card-top">
                <span className="module-icon">{item.shortLabel}</span>
                <span className="status-pill">本轮交付</span>
              </div>
              <h3>{item.label}</h3>
              <p>{item.description}</p>
            </Link>
          ))}
        </div>
        <div className="reserve-strip">
          {reservedModules.map((item) => (
            <Link key={item.href} href={item.href} className="reserve-card">
              <div className="module-card-top">
                <span className="module-icon">{item.shortLabel}</span>
                <span className="placeholder-status placeholder-warning">预留页</span>
              </div>
              <h3>{item.label}</h3>
              <p>{item.description}</p>
              <span className="reserve-note">本轮不交付，仅保留后续挂接位置。</span>
            </Link>
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
          <p>首页不只做导航，还把数据链路、导入入口和验收边界讲清楚，减少进入各页后的理解成本。</p>
        </div>
        <div className="home-rail-grid">
          <article className="rail-card">
            <span className="rail-index">01</span>
            <h3>学校与院系</h3>
            <p>先落学校和院系基础档案，保证后续 `programs` 外键映射、导入定位和筛选维度完整。</p>
          </article>
          <article className="rail-card">
            <span className="rail-index">02</span>
            <h3>专业主表</h3>
            <p>以具体招生专业为粒度管理 `programs`，研究方向、学位类型和数学要求都保留到详情区。</p>
          </article>
          <article className="rail-card">
            <span className="rail-index">03</span>
            <h3>年份与来源</h3>
            <p>四张 `program_*` 年份表和 `program_source_links` 分开治理，方便按来源可信度和年份逐批维护。</p>
          </article>
        </div>
      </section>
    </div>
  );
}
