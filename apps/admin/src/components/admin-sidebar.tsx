"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "@/components/admin-auth-provider";
import { adminNavigation, superAdminNavigation } from "@/config/admin-navigation";

type AdminSidebarProps = {
  id: string;
  isDrawerMode: boolean;
  isOpen: boolean;
  onNavigate?: () => void;
};

function NavLinks({
  items,
  pathname,
  ariaHidden,
  onNavigate,
}: {
  items: typeof adminNavigation;
  pathname: string;
  ariaHidden: boolean;
  onNavigate?: () => void;
}) {
  return items.map((item) => {
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
  });
}

export function AdminSidebar({ id, isDrawerMode, isOpen, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();
  const { session } = useAdminAuth();
  const ariaHidden = isDrawerMode && !isOpen;
  const isSuperAdmin = session?.adminUser.role === "super_admin";

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
            学校与用户数据治理、后台权限管理一体化的 MVP 运营工作台。
          </p>
        </div>
      </div>

      <div className="sidebar-group">
        <p className="sidebar-label">业务导航</p>
        <nav className="sidebar-nav" aria-label="后台模块导航">
          <NavLinks
            items={adminNavigation}
            pathname={pathname}
            ariaHidden={Boolean(ariaHidden)}
            onNavigate={onNavigate}
          />
        </nav>
      </div>

      {isSuperAdmin ? (
        <div className="sidebar-group">
          <p className="sidebar-label">权限管理</p>
          <nav className="sidebar-nav" aria-label="超级管理员导航">
            <NavLinks
              items={superAdminNavigation}
              pathname={pathname}
              ariaHidden={Boolean(ariaHidden)}
              onNavigate={onNavigate}
            />
          </nav>
        </div>
      ) : null}

      <div className="sidebar-footer">
        <p>当前账号：{session?.adminUser.displayName ?? "未登录"}</p>
        <p>角色：{isSuperAdmin ? "超级管理员" : "管理员"}</p>
      </div>
    </aside>
  );
}
