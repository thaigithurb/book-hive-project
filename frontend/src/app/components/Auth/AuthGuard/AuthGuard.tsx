"use client";
import { useEffect, useState } from "react";
import axios from "axios";

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;

export default function AdminAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        try {
          const res = await axios.post(
            `http://localhost:3001/api/v1/${ADMIN_PREFIX}/auth/refresh`,
            {},
            { withCredentials: true }
          );
          const newAccessToken = res.data.accessToken;
          localStorage.setItem("accessToken", newAccessToken);
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
          setCheckedAuth(true);
        } catch {
          try {
            const res = await axios.post(
              `http://localhost:3001/api/v1/${ADMIN_PREFIX}/auth/refresh`,
              {},
              { withCredentials: true }
            );
            const newAccessToken = res.data.accessToken;
            localStorage.setItem("accessToken", newAccessToken);
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
