"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type AdminUser = {
  id: string;
  email: string;
  role: string;
  permissions: string[];
} | null;

type AdminContextType = {
  admin: AdminUser;
  setAdmin: any;
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser>(null);

  useEffect(() => {
    const adminStr = localStorage.getItem("admin_user");
    const accessToken = localStorage.getItem("accessToken_admin");

    if (!adminStr || !accessToken) {
      localStorage.removeItem("admin_user");
      localStorage.removeItem("accessToken_admin");
      setAdmin(null);
      return;
    }

    if (adminStr) {
      try {
        setAdmin(JSON.parse(adminStr));
      } catch {
        localStorage.removeItem("admin_user");
        localStorage.removeItem("accessToken_admin");
        setAdmin(null);
      }
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "admin_user" || e.key === "accessToken_admin") {
        const adminStr = localStorage.getItem("admin_user");
        const accessToken = localStorage.getItem("accessToken_admin");

        if (!adminStr || !accessToken) {
          localStorage.removeItem("admin_user");
          localStorage.removeItem("accessToken_admin");
          setAdmin(null);
          return;
        }

        if (adminStr) {
          try {
            setAdmin(JSON.parse(adminStr));
          } catch {
            localStorage.removeItem("admin_user");
            localStorage.removeItem("accessToken_admin");
            setAdmin(null);
          }
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <AdminContext.Provider value={{ admin, setAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context)
    throw new Error("useAdmin phải được sử dụng bên trong AdminProvider");
  return context;
};
