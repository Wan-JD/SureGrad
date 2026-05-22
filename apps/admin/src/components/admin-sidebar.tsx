"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavigation } from "@/config/admin-navigation";

type AdminSidebarProps = {
  id: string;
  isDrawerMode: boolean;
  isOpen: boolean;
  onNavigate?: () => void;
};

export function AdminSidebar({ id, isDrawerMode, isOpen, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();
  const ariaHidden = isDrawerMode && !isOpen;

  return (
    <aside
      id={id}
      className="admin-sidebar"
      aria-hidden={ariaHidden || undefined}
      inert={ariaHidden ? true : undefined}
    >
      <div className="brand-block">
        <span className="brand-mark">SG</span>
        <div>
          <p className="brand-title">SureGrad Admin</p>
          <p className="brand-subtitle">
            围绕学校、专业、年份数据与来源治理搭建的 MVP 运营工作台。
          </p>
        </div>
      </div>

      <div className="sidebar-group">
        <p className="sidebar-label">业务导航</p>
        <nav className="sidebar-nav" aria-label="后台模块导航">
          {adminNavigation.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={isActive ? "nav-item active" : "nav-item"}
                onClick={onNavigate}
                tabIndex={ariaHidden ? -1 : undefined}
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
        <p>当前优先支持数据录入、核对与治理，不进入复杂流程审批。</p>
        <p>后续可以继续接入登录权限、服务端分页、表单校验与修订日志。</p>
      </div>
    </aside>
  );
}
