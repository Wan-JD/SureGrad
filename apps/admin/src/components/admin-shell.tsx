"use client";

import { useCallback, useEffect, useId, useState, type ReactNode } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";

type AdminShellProps = {
  children: ReactNode;
};

const DRAWER_BREAKPOINT = "(max-width: 1080px)";

export function AdminShell({ children }: AdminShellProps) {
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

  const shellClassName = [
    "admin-shell",
    isDrawerMode && navOpen ? "admin-shell--nav-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

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
                面向 SureGrad MVP 数据治理场景的运营工作台。当前覆盖学校、院系、专业、年份数据、资料推荐与来源链接
                六类核心页面，统一承接筛选、列表、详情和导入修订入口，方便后续接入真实 API。
              </p>
            </div>
          </div>
          <div className="topbar-tag">当前状态：运营工作台可演示</div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
