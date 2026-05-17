import Link from "next/link";
import { adminNavigation } from "@/config/admin-navigation";

const focusAreas = [
  {
    title: "择校数据主链路",
    description:
      "围绕学校、院系、专业以及挂接在专业上的年份指标，承接 MVP 的核心择校数据维护。",
    points: ["schools", "departments", "programs", "program_* 年份表"],
  },
  {
    title: "资料与来源治理",
    description:
      "优先满足资料推荐和来源追踪，确保后台录入的信息能在前台保留来源可追溯能力。",
    points: ["study_resources", "program_source_links", "subjects", "books"],
  },
  {
    title: "当前实现边界",
    description:
      "本次仅完成后台壳、导航和页面占位，不接入接口、不实现增删改查表单，也不处理权限。",
    points: ["静态导航", "占位页", "结构说明", "可独立启动"],
  },
];

export default function Home() {
  return (
    <div className="page-stack">
      <section className="hero-card">
        <span className="eyebrow">SureGrad Admin</span>
        <h1>SureGrad 管理后台骨架</h1>
        <p className="hero-copy">
          这个版本先服务于 MVP 运营录入场景，围绕院校、院系、专业、年份数据、资料推荐和来源链接
          6 个模块搭建统一后台结构，方便后续继续接入 API 与表单流程。
        </p>
      </section>

      <section className="section-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Modules</span>
            <h2>模块入口</h2>
          </div>
          <p>以下页面均已挂入侧边导航，当前仍以骨架和占位说明为主。</p>
        </div>
        <div className="module-grid">
          {adminNavigation.map((item) => (
            <Link key={item.href} href={item.href} className="module-card">
              <div className="module-card-top">
                <span className="module-icon">{item.shortLabel}</span>
                <span className="status-pill">占位页</span>
              </div>
              <h3>{item.label}</h3>
              <p>{item.description}</p>
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
    </div>
  );
}
