import { useRouter, useSearchParams } from "next/navigation";

export function useSortChange(source: string) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (e: any, setSort: (val: any) => void, setPage: (val: any) =>  void) => {
    const val = e.target.value;
    let sortKey = "";
    let sortValue = "";
    switch (val) {
      case "title_asc":
        setSort({ key: "title", value: 1 });
        sortKey = "title";
        sortValue = "1";
        break;
      case "title_desc":
        setSort({ key: "title", value: -1 });
        sortKey = "title";
        sortValue = "-1";
        break;
      case "priceBuy_asc":
        setSort({ key: "priceBuy", value: 1 });
        sortKey = "priceBuy";
        sortValue = "1";
        break;
      case "priceBuy_desc":
        setSort({ key: "priceBuy", value: -1 });
        sortKey = "priceBuy";
        sortValue = "-1";
        break;
      case "createdAt_asc":
        setSort({ key: "createdAt", value: 1 });
        sortKey = "createdAt";
        sortValue = "1";
        break;
      case "createdAt_desc":
        setSort({ key: "createdAt", value: -1 });
        sortKey = "createdAt";
        sortValue = "-1";
        break;
      default:
        setSort(null);
        sortKey = "";
        sortValue = "";
    }
    // const params = new URLSearchParams(searchParams.toString());
    // if (sortKey) {
    //   params.set("sortKey", sortKey);
    //   params.set("sortValue", sortValue);
    //   setPage(1);
    // } else {
    //   params.delete("sortKey");
    //   params.delete("sortValue");
    // }
    // router.push(`/admin/${source}?${params.toString()}`);
  };
}