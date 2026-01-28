"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Book } from "@/app/interfaces/book.interface";
import { BookCard } from "@/app/components/Card/BookCard";
import { Loading } from "@/app/components/Loading/Loading";
import debounce from "lodash.debounce";
import Pagination from "@/app/components/Pagination/Pagination";
import SortSelect from "@/app/components/SortSelect/SortSelect";
import { useSyncParams } from "@/app/utils/useSyncParams";
import { usePageChange } from "@/app/utils/usePageChange";
import { useSortChange } from "@/app/utils/useSortChange";
import { BookCardSkeleton } from "@/app/components/Skeleton/BookCardSkeleton";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function BooksBuy() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState<{ key: string; value: 1 | -1 } | null>(null);
  const limit = 12;
  const [firstLoad, setFirstLoad] = useState(true);
  const [sortValue, setSortValue] = useState("");
  const sortOptions = [
    { value: "", label: "Sắp xếp" },
    { value: "title_asc", label: "Tên A-Z" },
    { value: "title_desc", label: "Tên Z-A" },
    { value: "priceBuy_asc", label: "Giá mua tăng" },
    { value: "priceBuy_desc", label: "Giá mua giảm" },
    { value: "createdAt_desc", label: "Mới nhất" },
    { value: "createdAt_asc", label: "Cũ nhất" },
  ];
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken_user");
    setIsLoggedIn(!!token);
  }, []);

  const fetchData = useCallback(
    debounce(() => {
      setBooks([]);
      setLoading(true);
      axios
        .get(`${API_URL}/api/v1/books/buy-only`, {
          params: {
            ...(keyword && { keyWord: keyword }),
            ...(sort && { sortKey: sort.key, sortValue: sort.value }),
            page,
            limit,
          },
        })
        .then((res) => {
          setBooks(res.data.books || []);
          setTotal(res.data.total || 0);
        })
        .catch((errors) => setBooks([]))
        .finally(() => {
          setLoading(false);
          setFirstLoad(false);
        });
    }, 400),
    [sort, keyword, page],
  );

  useEffect(() => {
    fetchData();
    return fetchData.cancel;
  }, [fetchData]);

  useSyncParams(setPage, setSortValue, setSort);
  const handlePageChange = usePageChange("books/buy-only", setPage, "client");
  const handleSortChange = useSortChange("books/buy-only", "client");

  if (firstLoad && loading) {
    return <Loading fullScreen={true} size="lg" text="Đang tải sách..." />;
  }
  if (loading && books.length === 0) {
    return (
      <div className="py-[32px] px-[24px]">
        <div className="container">
          <div className="grid grid-cols-4 gap-[24px] mb-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="py-[32px] px-[24px]">
        <div className="container">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold mb-4 text-primary">Sách mua</h2>
            <SortSelect
              onChange={(e) => {
                setSortValue(e.target.value);
                handleSortChange(e, setSort);
              }}
              options={sortOptions}
              sortValue={sortValue}
            />
          </div>
          <div className="grid grid-cols-4 gap-[24px] mb-8">
            {books.map((book, index) => (
              <BookCard
                key={index}
                book={book}
                featured={book.featured ? true : false}
                isLoggedIn={isLoggedIn}
              />
            ))}
          </div>
          <Pagination
            page={page}
            total={total}
            limit={limit}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </>
  );
}
