"use client";

import { useCallback, useEffect, useId, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";
import { useAdminAuth } from "@/components/admin-auth-provider";

type AdminShellProps = {
  children: ReactNode;
};

const DRAWER_BREAKPOINT = "(max-width: 1080px)";

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const { session, logout, isReady } = useAdminAuth();
  const sidebarId = useId();
  const [navOpen, setNavOpen] = useState(false);
  const [isDrawerMode, setIsDrawerMode] = useState(false);

  const closeNav = useCallback(() => setNavOpen(false), []);

  useEffect(() => {
    const media = window.matchMedia(DRAWER_BREAKPOINT);
    const syncDrawerMode = () => {
      setIsDrawerMode(media.matches);
      if (!media.matches) {
        setNavOpen(false);
      }
    };

    syncDrawerMode();
    media.addEventListener("change", syncDrawerMode);
    return () => media.removeEventListener("change", syncDrawerMode);
  }, []);

  useEffect(() => {
    if (!isDrawerMode || !navOpen) {
      document.body.classList.remove("admin-body--nav-open");
      return;
    }

    document.body.classList.add("admin-body--nav-open");
    return () => document.body.classList.remove("admin-body--nav-open");
  }, [isDrawerMode, navOpen]);

  useEffect(() => {
    if (!isDrawerMode || !navOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeNav();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeNav, isDrawerMode, navOpen]);

  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (!isReady) {
    return <div className="admin-auth-loading">正在校验登录状态…</div>;
  }

  const shellClassName = [
    "admin-shell",
    isDrawerMode && navOpen ? "admin-shell--nav-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const roleLabel =
    session?.adminUser.role === "super_admin" ? "超级管理员" : "管理员";

  return (
    <div className={shellClassName}>
      {isDrawerMode ? (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="关闭导航菜单"
          tabIndex={navOpen ? 0 : -1}
          onClick={closeNav}
        />
      ) : null}

      <AdminSidebar
        id={sidebarId}
        isDrawerMode={isDrawerMode}
        isOpen={navOpen}
        onNavigate={closeNav}
      />

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-leading">
            {isDrawerMode ? (
              <button
                type="button"
                className="nav-toggle"
                aria-label={navOpen ? "关闭导航菜单" : "打开导航菜单"}
                aria-expanded={navOpen}
                aria-controls={sidebarId}
                onClick={() => setNavOpen((open) => !open)}
              >
                <span className="nav-toggle-bar" aria-hidden="true" />
                <span className="nav-toggle-bar" aria-hidden="true" />
                <span className="nav-toggle-bar" aria-hidden="true" />
              </button>
            ) : null}
            <div>
              <p className="eyebrow">运营总览</p>
              <h1 className="topbar-title">SureGrad 管理后台</h1>
              <p className="topbar-copy">
                已接入登录鉴权：管理员可维护学校与 App 用户；超级管理员还可管理后台账号与角色升降。
              </p>
            </div>
          </div>
          <div className="topbar-actions">
            <div className="topbar-tag">
              {session?.adminUser.displayName ?? "未登录"} · {roleLabel}
            </div>
            <button type="button" className="topbar-logout" onClick={logout}>
              退出登录
            </button>
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
