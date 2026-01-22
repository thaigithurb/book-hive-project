"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@/contexts/UserContext";
import { Loading } from "@/app/components/Loading/Loading";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ClientAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [checkedAuth, setCheckedAuth] = useState(false);
  const { setUser } = useUser();

  const setUserFromToken = (token: string) => {
    try {
      const userStr = localStorage.getItem("client_user");
      if (userStr) {
        setUser(JSON.parse(userStr));
        return;
      }
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser({
        id: payload.id,
        email: payload.email,
        role: payload.role,
      });
    } catch {
      setUser(null);
    }
  };

  const refreshAccessToken = async () => {
    try {
      const res = await axios.post(
        `http://localhost:3001/api/v1/auth/refresh`,
        {},
        { withCredentials: true },
      );

      if (res.data?.accessToken) {
        localStorage.setItem("accessToken_user", res.data.accessToken);
        setUserFromToken(res.data.accessToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Refresh token failed:", error);
      localStorage.removeItem("accessToken_user");
      localStorage.removeItem("client_user");
      return false;
    }
  };

  const verifyToken = async (token: string) => {
    try {
      await axios.post(
        `http://localhost:3001/api/v1/auth/verify`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        let accessToken = localStorage.getItem("accessToken_user");

        if (!accessToken) {
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            setCheckedAuth(true);
          } else {
            setCheckedAuth(true);
          }
          return;
        }

        const isValid = await verifyToken(accessToken);
        if (isValid) {
          setUserFromToken(accessToken);
          setCheckedAuth(true);
          return;
        }

        const refreshed = await refreshAccessToken();
        setCheckedAuth(true);
      } catch (error) {
        console.error("Auth check error:", error);
        setCheckedAuth(true);
      }
    };

    checkAuth();
  }, [setUser]);

  if (!checkedAuth)
    return <Loading fullScreen={true} size="lg" text="Đang xác thực..." />;
  return <>{children}</>;
}