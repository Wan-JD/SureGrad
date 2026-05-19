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
            <span className="eyebrow">Coming Next</span>
            <h1>{title}</h1>
            <p className="placeholder-copy">{description}</p>
          </div>
          <div className="placeholder-status placeholder-warning">本轮不交付</div>
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
              <span className="placeholder-icon">数据</span>
            </div>
            <h2>关联数据内容</h2>
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
          当前页面仍是预留模块，只承担导航落点与结构边界说明。本轮不会把它与已交付运营页混写，后续再接入列表、
          筛选、表单、校验与权限能力。
        </p>
      </section>
    </div>
  );
}
