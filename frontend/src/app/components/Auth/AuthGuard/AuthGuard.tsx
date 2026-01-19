"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@/contexts/UserContext";

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [checkedAuth, setCheckedAuth] = useState(false);
  const { setUser } = useUser();

  const setUserFromToken = (token: string) => {
    try {
      const userStr = localStorage.getItem("admin_user");
      if (userStr) {
        setUser(JSON.parse(userStr));
        return;
      }
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser({
        id: payload.id,
        email: payload.email,
        role: payload.role,
        permissions: payload.permissions || [],
      });
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      let accessToken = localStorage.getItem("accessToken_admin");
      if (!accessToken) {
        try {
          const res = await axios.post(
            `${API_URL}/api/v1/${ADMIN_PREFIX}/auth/refresh`,
            {},
            { withCredentials: true }
          );
          localStorage.setItem("accessToken_admin", res.data.accessToken);
          setUserFromToken(res.data.accessToken);
          setCheckedAuth(true);
        } catch {
          window.location.href = `/auth/${ADMIN_PREFIX}/login`;
        }
      } else {
        try {
          await axios.post(
            `${API_URL}/api/v1/${ADMIN_PREFIX}/auth/verify`,
            {},
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          setUserFromToken(accessToken);
          setCheckedAuth(true);
        } catch {
          try {
            const res = await axios.post(
              `${API_URL}/api/v1/${ADMIN_PREFIX}/auth/refresh`,
              {},
              { withCredentials: true }
            );
            localStorage.setItem("accessToken_admin", res.data.accessToken);
            setUserFromToken(res.data.accessToken);
            setCheckedAuth(true);
          } catch {
            window.location.href = `/auth/${ADMIN_PREFIX}/login`;
          }
        }
      }
    };
    checkAuth();
  }, []);

  if (!checkedAuth) return null;
  return <>{children}</>;
}
