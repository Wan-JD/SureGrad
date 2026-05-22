"use client";

import { FormEvent, useState } from "react";
import { useAdminAuth } from "@/components/admin-auth-provider";

export default function LoginPage() {
  const { login } = useAdminAuth();
  const [username, setUsername] = useState("superadmin");
  const [password, setPassword] = useState("super123");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submitLogin() {
    setSubmitting(true);
    setError(null);

    try {
      await login(username.trim(), password);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "登录失败，请稍后重试",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitLogin();
  }

  return (
    <div className="admin-login-page">
      <section className="admin-login-card">
        <p className="eyebrow">SureGrad Admin</p>
        <h1>管理后台登录</h1>
        <p className="admin-login-copy">
          管理员可维护学校与 App 用户信息；超级管理员还可管理后台账号与角色升降。
        </p>

        <form className="admin-login-form" method="dialog" onSubmit={handleSubmit}>
          <label className="admin-login-field">
            <span>用户名</span>
            <input
              name="username"
              value={username}
              autoComplete="username"
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </label>

          <label className="admin-login-field">
            <span>密码</span>
            <input
              name="password"
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error ? <p className="admin-login-error">{error}</p> : null}

          <button type="submit" className="admin-login-submit" disabled={submitting}>
            {submitting ? "登录中…" : "登录后台"}
          </button>
        </form>

        <p className="admin-login-hint">
          本地开发默认账号：superadmin / super123，admin / admin123
        </p>
      </section>
    </div>
  );
}
