export type ImportTemplateCategory = "core" | "yearly" | "resources";

export type ImportTemplateMeta = {
  label: string;
  hint: string;
  category: ImportTemplateCategory;
};

export const IMPORT_TEMPLATE_META: Record<string, ImportTemplateMeta> = {
  "schools.csv": {
    label: "学校档案",
    hint: "院校基础信息、官网与层级",
    category: "core",
  },
  "departments.csv": {
    label: "院系归属",
    hint: "学校下的院系结构与代码",
    category: "core",
  },
  "programs.csv": {
    label: "专业主表",
    hint: "招生专业、学位类型与学制",
    category: "core",
  },
  "program_score_lines.csv": {
    label: "分数线",
    hint: "按年份记录初试总分与单科线",
    category: "yearly",
  },
  "program_source_links.csv": {
    label: "来源链接",
    hint: "简章、通知等可追溯出处",
    category: "core",
  },
  "program_admissions.csv": {
    label: "招生计划",
    hint: "计划招生、推免与统考名额",
    category: "yearly",
  },
  "program_application_stats.csv": {
    label: "报录比统计",
    hint: "报名、实考与录取人数",
    category: "yearly",
  },
  "program_interview_stats.csv": {
    label: "复试录取统计",
    hint: "复试人数、权重与最终录取",
    category: "yearly",
  },
  "program_exam_subjects.csv": {
    label: "初试科目",
    hint: "科目代码与考试范围映射",
    category: "resources",
  },
  "program_reference_books.csv": {
    label: "参考书目",
    hint: "专业对应的推荐教材清单",
    category: "resources",
  },
};

const CATEGORY_LABELS: Record<ImportTemplateCategory, string> = {
  core: "主数据（学校 → 院系 → 专业）",
  yearly: "年度数据（招生与分数）",
  resources: "科目与资料",
};

const CATEGORY_ORDER: ImportTemplateCategory[] = ["core", "yearly", "resources"];

export type MissingTemplateGroup = {
  category: ImportTemplateCategory;
  categoryLabel: string;
  items: Array<{ fileName: string; label: string; hint: string }>;
};

export function describeMissingTemplate(fileName: string): { label: string; hint: string; category: ImportTemplateCategory } {
  const meta = IMPORT_TEMPLATE_META[fileName];

  if (meta) {
    return meta;
  }

  return {
    label: fileName.replace(/\.csv$/i, "").replaceAll("_", " "),
    hint: "请按 data-import 模板补录对应 CSV",
    category: "resources",
  };
}

export function groupMissingTemplates(fileNames: string[]): MissingTemplateGroup[] {
  const grouped = new Map<ImportTemplateCategory, MissingTemplateGroup["items"]>();

  for (const fileName of fileNames) {
    const { label, hint, category } = describeMissingTemplate(fileName);
    const items = grouped.get(category) ?? [];
    items.push({ fileName, label, hint });
    grouped.set(category, items);
  }

  return CATEGORY_ORDER.flatMap((category) => {
    const items = grouped.get(category);

    if (!items?.length) {
      return [];
    }

    return [
      {
        category,
        categoryLabel: CATEGORY_LABELS[category],
        items,
      },
    ];
  });
}

export function filterMissingByCategory(
  fileNames: string[],
  categories: ImportTemplateCategory[],
): string[] {
  const allowed = new Set(categories);

  return fileNames.filter((fileName) => allowed.has(describeMissingTemplate(fileName).category));
}
