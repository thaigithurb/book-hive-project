"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@/contexts/UserContext";

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;

export default function AdminAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [checkedAuth, setCheckedAuth] = useState(false);
  const { setUser } = useUser();

  const setUserFromToken = (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser({ role: payload.role, email: payload.email });
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      let accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        try {
          const res = await axios.post(
            `http://localhost:3001/api/v1/${ADMIN_PREFIX}/auth/refresh`,
            {},
            { withCredentials: true }
          );
          localStorage.setItem("accessToken", res.data.accessToken);
          setUserFromToken( res.data.accessToken);
          setCheckedAuth(true);
        } catch {
          window.location.href = "/auth/login";
        }
      } else {
        try {
          await axios.post(
            `http://localhost:3001/api/v1/${ADMIN_PREFIX}/auth/verify`,
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
              `http://localhost:3001/api/v1/${ADMIN_PREFIX}/auth/refresh`,
              {},
              { withCredentials: true }
            );
            localStorage.setItem("accessToken", res.data.accessToken);
            setUserFromToken(res.data.accessToken);
            setCheckedAuth(true);
          } catch {
            window.location.href = "/auth/login";
          }
        }
      }
    };
    checkAuth();
  }, []);

  if (!checkedAuth) return null;
  return <>{children}</>;
}
