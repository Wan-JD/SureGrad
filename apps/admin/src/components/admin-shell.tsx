import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="eyebrow">MVP Console</p>
            <h1 className="topbar-title">SureGrad 管理后台</h1>
            <p className="topbar-copy">
              面向 SureGrad MVP 数据维护场景的后台骨架。当前仅提供导航、布局和模块占位，
              便于后续分阶段接入学校、专业、年份数据和资料治理能力。
            </p>
          </div>
          <div className="topbar-tag">当前状态：骨架已就位</div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
