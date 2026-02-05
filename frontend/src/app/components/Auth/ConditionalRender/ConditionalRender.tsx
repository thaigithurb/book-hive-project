"use client";

import { useAdmin } from "@/contexts/AdminContext";

interface ConditionalRenderProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ConditionalRender({
  permission,
  children,
  fallback = null,
}: ConditionalRenderProps) {
  const { admin } = useAdmin();

  if (admin === undefined) return null;
  if (!admin?.permissions?.includes(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
