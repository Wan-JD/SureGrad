type ModulePlaceholderProps = {
  title: string;
  description: string;
  scope: string[];
  relatedTables: string[];
  nextSteps: string[];
};

export function ModulePlaceholder({
  title,
  description,
  scope,
  relatedTables,
  nextSteps,
}: ModulePlaceholderProps) {
  return (
    <div className="page-stack">
      <section className="placeholder-card">
        <div className="placeholder-heading">
          <div>
            <span className="eyebrow">Module Placeholder</span>
            <h1>{title}</h1>
            <p className="placeholder-copy">{description}</p>
          </div>
          <div className="placeholder-status">当前阶段：占位页</div>
        </div>

        <div className="placeholder-grid">
          <section className="placeholder-panel">
            <div className="placeholder-chip-row">
              <span className="placeholder-icon">范围</span>
            </div>
            <h2>预留能力范围</h2>
            <ul className="placeholder-list">
              {scope.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="placeholder-panel">
            <div className="placeholder-chip-row">
              <span className="placeholder-icon">表</span>
            </div>
            <h2>对应数据模型</h2>
            <ul className="placeholder-list">
              {relatedTables.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="placeholder-panel">
            <div className="placeholder-chip-row">
              <span className="placeholder-icon">后续</span>
            </div>
            <h2>下一步可接入</h2>
            <ul className="placeholder-list">
              {nextSteps.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>

        <p className="placeholder-note">
          说明：当前页面只承担导航落点和模块边界说明，不包含接口请求、表格分页、筛选器、
          表单校验或权限控制。
        </p>
      </section>
    </div>
  );
}
