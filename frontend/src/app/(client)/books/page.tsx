"use client";

import { useCallback, useEffect, useState } from "react";

import axios from "axios";
import { Book } from "@/app/interfaces/book.interface";
import { BookCard } from "@/app/components/Card/BookCard/BookCard";
import debounce from "lodash.debounce";
import Pagination from "@/app/components/Pagination/Pagination";
import { div } from "framer-motion/client";
import SortSelect from "@/app/components/SortSelect/SortSelect";
import { useRouter, useSearchParams } from "next/navigation";

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState<{ key: string; value: 1 | -1 } | null>(null);
  const limit = 12;
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
  const router = useRouter();
  const searchParams = useSearchParams();

  // xử lí load data cùng với lọc và tìm kiếm
  const fetchData = useCallback(
    debounce(() => {
      setLoading(true);
      axios
        .get(`http://localhost:3001/api/v1/books`, {
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
        });
    }, 400),
    [sort, keyword, page]
  );

  useEffect(() => {
    fetchData();
    return fetchData.cancel;
  }, [fetchData]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const params = new URLSearchParams(searchParams.toString());
    if (newPage > 1) {
      params.set("page", newPage.toString());
    } else {
      params.delete("page");
    }
    router.push(`/books?${params.toString()}`);
  };

  //  Xử lý thay đổi sort từ dropdown
  const handleSortChange = (e: any) => {
    const val = e.target.value;
    switch (val) {
      case "title_asc":
        setSort({ key: "title", value: 1 });
        break;
      case "title_desc":
        setSort({ key: "title", value: -1 });
        break;
      case "priceBuy_asc":
        setSort({ key: "priceBuy", value: 1 });
        break;
      case "priceBuy_desc":
        setSort({ key: "priceBuy", value: -1 });
        break;
      case "createdAt_asc":
        setSort({ key: "createdAt", value: 1 });
        break;
      case "createdAt_desc":
        setSort({ key: "createdAt", value: -1 });
        break;
      default:
        setSort(null);
    }
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set("sort", val);
    } else {
      params.delete("sort");
    }
    router.push(`/books?${params.toString()}`);
  };

  return (
    <>
      <div className="py-[32px] px-[24px]">
        <div className="container">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold mb-4 text-primary">
              Tất cả sách
            </h2>
            <SortSelect
              onChange={handleSortChange}
              options={sortOptions}
              sortValue={sortValue}
            />
          </div>
          {loading ? (
            <div className="flex items-center justify-center min-h-screen text-gray-500 text-center col-span-3">
              Đang tải...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-[24px] mb-8">
                {books.map((book, index) => (
                  <BookCard
                    key={index}
                    book={book}
                    featured={book.featured ? true : false}
                  />
                ))}
              </div>
              <Pagination
                page={page}
                total={total}
                limit={limit}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}
