"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavigation } from "@/config/admin-navigation";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      <div className="brand-block">
        <span className="brand-mark">SG</span>
        <div>
          <p className="brand-title">SureGrad Admin</p>
          <p className="brand-subtitle">
            围绕学校、专业、年份数据与资料来源的 MVP 后台工作台。
          </p>
        </div>
      </div>

      <div className="sidebar-group">
        <p className="sidebar-label">Navigation</p>
        <nav className="sidebar-nav" aria-label="后台模块导航">
          {adminNavigation.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={isActive ? "nav-item active" : "nav-item"}
              >
                <span className="nav-badge">{item.shortLabel}</span>
                <span className="nav-content">
                  <span className="nav-title">{item.label}</span>
                  <span className="nav-description">{item.description}</span>
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-footer">
        <p>优先支持数据录入和治理，暂不进入复杂业务流程。</p>
        <p>后续可继续接入登录、权限、表格、检索与表单能力。</p>
      </div>
    </aside>
  );
}
