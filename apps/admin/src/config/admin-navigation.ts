export type AdminNavItem = {
  href: string;
  label: string;
  shortLabel: string;
  description: string;
};

export const adminNavigation: AdminNavItem[] = [
  {
    href: "/users",
    label: "用户管理",
    shortLabel: "用户",
    description: "管理 App 普通用户账号，支持检索、详情查看与启用/停用。",
  },
  {
    href: "/schools",
    label: "学校管理",
    shortLabel: "学校",
    description: "维护学校档案、地区标签、官网信息和展示状态。",
  },
  {
    href: "/departments",
    label: "院系管理",
    shortLabel: "院系",
    description: "维护院系归属关系、院系名称和官网信息。",
  },
  {
    href: "/programs",
    label: "专业管理",
    shortLabel: "专业",
    description: "维护专业名称、学位类型、学科门类和研究方向。",
  },
  {
    href: "/yearly-data",
    label: "年份数据",
    shortLabel: "年份",
    description:
      "统一管理招生计划、分数线、报录比和复录比等年度数据。",
  },
  {
    href: "/resources",
    label: "资料推荐",
    shortLabel: "资料",
    description: "维护推荐清单、适用科目、学习阶段和可见状态。",
  },
  {
    href: "/source-links",
    label: "来源链接",
    shortLabel: "来源",
    description: "维护链接状态、来源类型、发布时间和复核时间。",
  },
];

export const superAdminNavigation: AdminNavItem[] = [
  {
    href: "/admins",
    label: "管理员账号",
    shortLabel: "权限",
    description: "超级管理员专属：新增后台账号、角色升降与启用/停用。",
  },
];
