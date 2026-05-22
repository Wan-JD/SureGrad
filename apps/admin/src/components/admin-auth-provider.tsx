"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { postAdminJson } from "@/lib/admin-api-client";
import {
  clearAdminSession,
  readAdminSession,
  writeAdminSession,
  type AdminSession,
  type AdminSessionUser,
} from "@/lib/admin-session";

type AdminAuthContextValue = {
  session: AdminSession | null;
  isReady: boolean;
  login: (_username: string, _password: string) => Promise<void>;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

const PUBLIC_PATHS = new Set(["/login"]);

type AdminLoginResponse = {
  accessToken: string;
  adminUser: AdminSessionUser;
};

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setSession(readAdminSession());
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const isPublic = PUBLIC_PATHS.has(pathname);

    if (!session && !isPublic) {
      router.replace("/login");
      return;
    }

    if (session && (pathname === "/login" || pathname === "/")) {
      router.replace("/users");
    }
  }, [isReady, pathname, router, session]);

  const login = useCallback(async (username: string, password: string) => {
    const response = await postAdminJson<AdminLoginResponse>(
      "/admin/auth/login",
      { username, password },
      { auth: false },
    );

    const nextSession: AdminSession = {
      accessToken: response.accessToken,
      adminUser: response.adminUser,
    };

    writeAdminSession(nextSession);
    setSession(nextSession);
    router.replace("/users");
  }, [router]);

  const logout = useCallback(() => {
    clearAdminSession();
    setSession(null);
    router.replace("/login");
  }, [router]);

  const value = useMemo(
    () => ({
      session,
      isReady,
      login,
      logout,
    }),
    [isReady, login, logout, session],
  );

  return (
    <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}
