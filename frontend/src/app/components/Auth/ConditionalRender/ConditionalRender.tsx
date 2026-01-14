import { useUser } from "@/contexts/UserContext";

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
  const { user } = useUser();

  if (user === undefined) return null;
  if (!user?.permissions?.includes(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
