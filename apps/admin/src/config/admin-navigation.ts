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
    description: "维护学校基础信息、层次标签与官网字段。",
  },
  {
    href: "/departments",
    label: "院系管理",
    shortLabel: "院系",
    description: "管理学校下属院系和院系站点信息。",
  },
  {
    href: "/programs",
    label: "专业管理",
    shortLabel: "专业",
    description: "维护招生专业、学位类型和研究方向。",
  },
  {
    href: "/yearly-data",
    label: "年份数据管理",
    shortLabel: "年份",
    description: "预留分数线、报录比、复录比等年份数据入口。",
  },
  {
    href: "/resources",
    label: "资料推荐管理",
    shortLabel: "资料",
    description: "管理学习资料推荐、阶段标签与科目关联。",
  },
  {
    href: "/source-links",
    label: "来源链接管理",
    shortLabel: "来源",
    description: "维护官方来源链接、校验状态与发布时间。",
  },
];
