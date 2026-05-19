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
              面向 SureGrad MVP 数据治理场景的运营工作台。当前聚焦学校、院系、专业、年份数据与来源链接
              五类核心页面，先把筛选、列表、详情和导入修订入口统一起来，方便后续接入真实 API。
            </p>
          </div>
          <div className="topbar-tag">当前状态：首批运营页开发中</div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
