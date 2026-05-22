"use client";

import { StaffLiveWorkspace } from "@/components/staff-live-workspace";
import { useAdminAuth } from "@/components/admin-auth-provider";

export default function AdminsPage() {
  const { session } = useAdminAuth();

  if (session?.adminUser.role !== "super_admin") {
    return (
      <section className="section-card">
        <h1>管理员账号</h1>
        <p>仅超级管理员可访问此页面。如需调整后台账号，请联系超级管理员。</p>
      </section>
    );
  }

  return <StaffLiveWorkspace />;
}
