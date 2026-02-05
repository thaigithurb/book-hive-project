"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type User = {
  id: string;
  email: string;
  role: string;
  fullName: string;
  permissions: string[];
} | null;

type UserContextType = {
  user: User;
  setUser: any;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const userStr = localStorage.getItem("client_user");
    const accessToken = localStorage.getItem("accessToken_user");

    // Nếu một trong hai không có → logout
    if (!userStr || !accessToken) {
      localStorage.removeItem("client_user");
      localStorage.removeItem("accessToken_user");
      setUser(null);
      return;
    }

    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {
        localStorage.removeItem("client_user");
        localStorage.removeItem("accessToken_user");
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "client_user" || e.key === "accessToken_user") {
        const userStr = localStorage.getItem("client_user");
        const accessToken = localStorage.getItem("accessToken_user");

        if (!userStr || !accessToken) {
          localStorage.removeItem("client_user");
          localStorage.removeItem("accessToken_user");
          setUser(null);
          return;
        }

        if (userStr) {
          try {
            setUser(JSON.parse(userStr));
          } catch {
            localStorage.removeItem("client_user");
            localStorage.removeItem("accessToken_user");
            setUser(null);
          }
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context)
    throw new Error("useUser phải được sử dụng bên trong UserProvider");
  return context;
};
