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
      const userStr = localStorage.getItem("user");
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
      let accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        try {
          const res = await axios.post(
            `http://localhost:3001/api/v1/auth/refresh`,
            {},
            { withCredentials: true }
          );
          localStorage.setItem("accessToken", res.data.accessToken);
          setUserFromToken(res.data.accessToken);
          setCheckedAuth(true);
        } catch {
          router.push("/auth/login");
          setCheckedAuth(true);
        }
      } else {
        try {
          await axios.post(
            `http://localhost:3001/api/v1/auth/verify`,
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
              `http://localhost:3001/api/v1/auth/refresh`,
              {},
              { withCredentials: true }
            );
            localStorage.setItem("accessToken", res.data.accessToken);
            setUserFromToken(res.data.accessToken);
            setCheckedAuth(true);
          } catch {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            router.push("/auth/login");
            setCheckedAuth(true);
          }
        }
      }
    };

    checkAuth();
  }, [setUser, router]);

  if (!checkedAuth) return null;
  return <>{children}</>;
}
