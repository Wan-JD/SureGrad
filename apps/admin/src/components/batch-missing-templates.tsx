import type { CollectedBatchSummary } from "@/lib/collected-import-batches";
import {
  filterMissingByCategory,
  groupMissingTemplates,
  type ImportTemplateCategory,
} from "@/lib/import-template-labels";

type BatchMissingTemplatesProps = {
  batch: Pick<CollectedBatchSummary, "title" | "missingTemplates">;
  compact?: boolean;
};

export function BatchMissingTemplates({ batch, compact = false }: BatchMissingTemplatesProps) {
  const groups = groupMissingTemplates(batch.missingTemplates);

  if (groups.length === 0) {
    return (
      <div className="batch-gap-panel complete">
        <p className="batch-gap-title">CSV 模板已齐</p>
        <p className="batch-gap-copy">本批次已覆盖当前后台追踪的全部导入模板，可直接进入校验或入库流程。</p>
      </div>
    );
  }

  return (
    <div className={`batch-gap-panel${compact ? " compact" : ""}`}>
      <div className="batch-gap-header">
        <p className="batch-gap-title">还需补 {batch.missingTemplates.length} 份 CSV</p>
        <p className="batch-gap-copy">
          以下清单按运营动作分组，文件名仅作导入对照，请按对应业务含义补录后再跑校验。
        </p>
      </div>
      <div className="batch-gap-groups">
        {groups.map((group) => (
          <section key={group.category} className="batch-gap-group">
            <h4>{group.categoryLabel}</h4>
            <ul className="batch-gap-list">
              {group.items.map((item) => (
                <li key={item.fileName}>
                  <span className="batch-gap-item-label">{item.label}</span>
                  <span className="batch-gap-item-hint">{item.hint}</span>
                  <code className="batch-gap-file">{item.fileName}</code>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

type CollectedBatchGapsBannerProps = {
  batches: CollectedBatchSummary[];
  focusCategories?: ImportTemplateCategory[];
  title: string;
  description: string;
};

export function CollectedBatchGapsBanner({
  batches,
  focusCategories,
  title,
  description,
}: CollectedBatchGapsBannerProps) {
  const batchesWithGaps = batches
    .map((batch) => ({
      batch,
      missing:
        focusCategories === undefined
          ? batch.missingTemplates
          : filterMissingByCategory(batch.missingTemplates, focusCategories),
    }))
    .filter((entry) => entry.missing.length > 0);

  if (batchesWithGaps.length === 0) {
    return (
      <section className="batch-gaps-banner complete">
        <div>
          <span className="eyebrow">采集缺口</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <p className="batch-gaps-status">当前追踪批次均已补齐对应 CSV 模板。</p>
      </section>
    );
  }

  const totalMissing = batchesWithGaps.reduce((sum, entry) => sum + entry.missing.length, 0);

  return (
    <section className="batch-gaps-banner">
      <div className="batch-gaps-banner-head">
        <div>
          <span className="eyebrow">采集缺口</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div className="batch-gaps-metrics">
          <article className="batch-gaps-metric">
            <strong>{batchesWithGaps.length}</strong>
            <span>待补批次</span>
          </article>
          <article className="batch-gaps-metric">
            <strong>{totalMissing}</strong>
            <span>待补 CSV</span>
          </article>
        </div>
      </div>
      <div className="batch-gaps-stack">
        {batchesWithGaps.map(({ batch, missing }) => (
          <article key={batch.id} className="batch-gaps-entry">
            <div className="batch-gaps-entry-top">
              <h3>{batch.title}</h3>
              <span className="status-pill warn">缺 {missing.length} 份</span>
            </div>
            <BatchMissingTemplates batch={{ title: batch.title, missingTemplates: missing }} compact />
          </article>
        ))}
      </div>
    </section>
  );
}
