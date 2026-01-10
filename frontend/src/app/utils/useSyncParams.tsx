import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function useSyncParams(setPage: (p: number) => void, setSortValue: (v: string) => void, setSort: (v: { key: string; value: 1 | -1 } | null) => void) {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Đồng bộ page
    const urlPage = Number(searchParams.get("page")) || 1;
    setPage(urlPage);

    // Đồng bộ sortValue và sort
    const urlSortKey = searchParams.get("sortKey");
    const urlSortValue = searchParams.get("sortValue");
    if (urlSortKey && urlSortValue) {
      const sortVal =
        urlSortKey === "title"
          ? `title_${urlSortValue === "asc" ? "asc" : "desc"}`
          : urlSortKey === "priceBuy"
          ? `priceBuy_${urlSortValue === "asc" ? "asc" : "desc"}`
          : urlSortKey === "createdAt"
          ? `createdAt_${urlSortValue === "asc" ? "asc" : "desc"}`
          : "";
      setSortValue(sortVal);
      setSort({
        key: urlSortKey,
        value: urlSortValue === "asc" ? 1 : -1,
      });
    } else {
      setSortValue("");
      setSort(null);
    }
  }, [searchParams, setPage, setSortValue, setSort]);
}