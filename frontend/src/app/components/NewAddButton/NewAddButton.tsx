"use client";
import { useRouter } from "next/navigation";

interface NewAddButtonProps {
    label: string,
    source: string
}

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;

export default function NewAddButton({
  label,
  source
}: NewAddButtonProps) {
  const router = useRouter();
  return (
    <>
      <button
        className="py-3 px-6 bg-secondary1 transition-colors duration-200 text-white rounded-[8px] text-[16px] font-semibold cursor-pointer hover:bg-blue-600"
        onClick={() => router.push(`/${ADMIN_PREFIX}/${source}/create`)}
      >
        ➕ {label}
      </button>
    </>
  );
}
