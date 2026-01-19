"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ClientAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [checkedAuth, setCheckedAuth] = useState(false);
  const { setUser } = useUser();
  const router = useRouter();

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
      });
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      let accessToken = localStorage.getItem("accessToken_user");
      if (!accessToken) {
        try {
          const res = await axios.post(
            `${API_URL}/api/v1/auth/refresh`,
            {},
            { withCredentials: true }
          );
          localStorage.setItem("accessToken_user", res.data.accessToken);
          setUserFromToken(res.data.accessToken);
          setCheckedAuth(true);
        } catch {
          window.location.href = `/auth/login`;
        }
      } else {
        try {
          await axios.post(
            `${API_URL}/api/v1/auth/verify`,
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
              `${API_URL}/api/v1/auth/refresh`,
              {},
              { withCredentials: true }
            );
            localStorage.setItem("accessToken_user", res.data.accessToken);
            setUserFromToken(res.data.accessToken);
            setCheckedAuth(true);
          } catch {
            window.location.href = `/auth/login`;
          }
        }
      }
    };

    checkAuth();
  }, []);

  if (!checkedAuth) return null;
  return <>{children}</>;
}
