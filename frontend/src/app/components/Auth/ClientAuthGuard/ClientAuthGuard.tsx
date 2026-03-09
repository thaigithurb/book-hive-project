"use client";
import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
        const accessToken = localStorage.getItem("accessToken_user");
        await axios.post(
          `${API_URL}/api/v1/auth/verify`,
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
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
