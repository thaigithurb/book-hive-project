import { useRouter, useSearchParams } from "next/navigation";

export function useSortChange(source: string) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (e: any, setSort: (val: any) => void )=> {
    const val = e.target.value;
    let sortKey = "";
    let sortValue = "";
    switch (val) {
      case "title_asc":
        setSort({ key: "title", value: 1 });
        sortKey = "title";
        sortValue = "asc";
        break;
      case "title_desc":
        setSort({ key: "title", value: -1 });
        sortKey = "title";
        sortValue = "desc";
        break;
      case "priceBuy_asc":
        setSort({ key: "priceBuy", value: 1 });
        sortKey = "priceBuy";
        sortValue = "asc";
        break;
      case "priceBuy_desc":
        setSort({ key: "priceBuy", value: -1 });
        sortKey = "priceBuy";
        sortValue = "desc";
        break;
      case "createdAt_asc":
        setSort({ key: "createdAt", value: 1 });
        sortKey = "createdAt";
        sortValue = "asc";
        break;
      case "createdAt_desc":
        setSort({ key: "createdAt", value: -1 });
        sortKey = "createdAt";
        sortValue = "desc";
        break;
      default:
        setSort(null);
        sortKey = "";
        sortValue = "";
    }

    const params = new URLSearchParams(searchParams.toString());
    if (sortKey && sortValue) {
      params.set("sortKey", sortKey);
      params.set("sortValue", sortValue);
      params.delete("page");
    } else {
      params.delete("sortKey");
      params.delete("sortValue");
      params.delete("page");
    }
    router.push(`/admin/${source}?${params.toString()}`);
  };
}
