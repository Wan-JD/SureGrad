export type AdminRole = "super_admin" | "admin";

export type AdminSessionUser = {
  adminUserId: string;
  username: string;
  displayName: string;
  role: AdminRole;
  status: "active" | "disabled";
  lastLoginAt: string | null;
};

export type AdminSession = {
  accessToken: string;
  adminUser: AdminSessionUser;
};

const ACCESS_TOKEN_KEY = "suregrad_admin_access_token";
const SESSION_KEY = "suregrad_admin_session";

export function readAdminSession(): AdminSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const accessToken = window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
  const rawSession = window.sessionStorage.getItem(SESSION_KEY);

  if (!accessToken || !rawSession) {
    return null;
  }

  try {
    const adminUser = JSON.parse(rawSession) as AdminSessionUser;
    if (!adminUser?.adminUserId || !adminUser.role) {
      return null;
    }

    return { accessToken, adminUser };
  } catch {
    return null;
  }
}

export function writeAdminSession(session: AdminSession) {
  window.sessionStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session.adminUser));
}

export function clearAdminSession() {
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  window.sessionStorage.removeItem(SESSION_KEY);
}

export function getAdminAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
}
