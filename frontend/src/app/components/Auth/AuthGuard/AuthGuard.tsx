"use client";
import { useEffect, useState } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { Loading } from "@/app/components/Loading/Loading";
import axiosAdmin from "@/libs/axios-admin";
import { useRouter } from "next/navigation";

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [checkedAuth, setCheckedAuth] = useState(false);
  const { setAdmin } = useAdmin();
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("accessToken_admin");
    localStorage.removeItem("admin_user");
    setAdmin(null);
    router.replace(`/auth/${ADMIN_PREFIX}/login`);
  };

  const checkAuth = async () => {
    const accessToken = localStorage.getItem("accessToken_admin");
    const adminUserStr = localStorage.getItem("admin_user");

    if (!accessToken || !adminUserStr) {
      logout();
      setCheckedAuth(true);
      return;
    }

    try {
      await axiosAdmin.post(`/api/v1/${ADMIN_PREFIX}/auth/verify`);
      const adminData = JSON.parse(adminUserStr);
      setAdmin(adminData);
    } catch {
      logout();
    } finally {
      setCheckedAuth(true);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [setAdmin]);

  useEffect(() => {
    const handleStorageChange = (e: any) => {
      if (e.key === "accessToken_admin" || e.key === "admin_user") {
        const accessToken = localStorage.getItem("accessToken_admin");
        const adminUserStr = localStorage.getItem("admin_user");

        if (!accessToken || !adminUserStr) {
          logout();
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [setAdmin]);

  if (!checkedAuth)
    return <Loading fullScreen={true} size="lg" text="Đang xác thực..." />;
  return <>{children}</>;
}
