import { useRouter, useSearchParams } from "next/navigation";

export function usePageChange(source: string, setPage: (page: number) => void) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (newPage: number) => {
    setPage(newPage);
    const params = new URLSearchParams(searchParams.toString());
    if (newPage > 1) {
      params.set("page", newPage.toString());
    } else {
      params.delete("page");
    }
    router.push(`/admin/${source}?${params.toString()}`);
  };
}