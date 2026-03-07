"use client";
import { useEffect, useState } from "react";
import axiosClient from "@/libs/axios-client";
import { useUser } from "@/contexts/UserContext";
import { Loading } from "@/app/components/Loading/Loading";

export default function ClientAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [checkedAuth, setCheckedAuth] = useState(false);
  const { setUser } = useUser();

  const logout = () => {
    localStorage.removeItem("accessToken_user");
    localStorage.removeItem("client_user");
    setUser(null);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem("accessToken_user");
      const clientUser = localStorage.getItem("client_user");

      if (!accessToken || !clientUser) {
        logout();
        setCheckedAuth(true);
        return;
      }

      try {
        await axiosClient.post("/api/v1/auth/verify");
        const userData = JSON.parse(clientUser);
        setUser(userData);
      } catch {
        logout();
      } finally {
        setCheckedAuth(true);
      }
    };

    checkAuth();
  }, [setUser]);

  useEffect(() => {
    const handleStorageChange = (e: any) => {
      if (e.key === "accessToken_user" || e.key === "client_user") {
        const accessToken = localStorage.getItem("accessToken_user");
        const clientUser = localStorage.getItem("client_user");

        if (!accessToken || !clientUser) {
          logout();
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [setUser]);

  return <>{children}</>;
}
