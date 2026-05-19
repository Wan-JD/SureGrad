export type AdminNavItem = {
  href: string;
  label: string;
  shortLabel: string;
  description: string;
};

export const adminNavigation: AdminNavItem[] = [
  {
    href: "/schools",
    label: "学校管理",
    shortLabel: "学校",
    description: "维护 schools 主表、地区标签、官网字段和排序状态。",
  },
  {
    href: "/departments",
    label: "院系管理",
    shortLabel: "院系",
    description: "维护 departments 与 schools 的从属关系和院系官网信息。",
  },
  {
    href: "/programs",
    label: "专业管理",
    shortLabel: "专业",
    description: "维护 programs 主表、学位类型、学科门类和研究方向。",
  },
  {
    href: "/yearly-data",
    label: "年份数据",
    shortLabel: "年份",
    description:
      "统一管理 program_admissions、program_score_lines、program_application_stats 和 program_interview_stats。",
  },
  {
    href: "/resources",
    label: "资料推荐",
    shortLabel: "资料",
    description: "本轮不交付，预留 study_resources、subjects 和阶段标签治理入口。",
  },
  {
    href: "/source-links",
    label: "来源链接",
    shortLabel: "来源",
    description: "维护 program_source_links 的链接状态、来源类型和校验时间。",
  },
];
