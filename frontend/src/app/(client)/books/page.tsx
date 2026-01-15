"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Book } from "@/app/interfaces/book.interface";
import { BookCard } from "@/app/components/Card/BookCard/BookCard";
import { Loading } from "@/app/components/Loading/Loading";
import debounce from "lodash.debounce";
import Pagination from "@/app/components/Pagination/Pagination";
import SortSelect from "@/app/components/SortSelect/SortSelect";
import { useRouter, useSearchParams } from "next/navigation";
import { useSyncParams } from "@/app/utils/useSyncParams";
import { usePageChange } from "@/app/utils/usePageChange";
import { useSortChange } from "@/app/utils/useSortChange";

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

  // ĐỒNG BỘ page với URL mỗi khi searchParams thay đổi
  useSyncParams(setPage, setSortValue, setSort);

  // hàm thay đổi trang
  const handlePageChange = usePageChange("books", setPage, "client");

  //  Xử lý thay đổi sort từ dropdown
  const handleSortChange = useSortChange("books", "client");

  // Full screen loading khi load lần đầu
  if (loading && books.length === 0) {
    return <Loading fullScreen={true} size="lg" text="Đang tải sách..." />;
  }

  return (
    <>
      <div className="py-[32px] px-[24px]">
        <div className="container">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold mb-4 text-primary">
              Tất cả sách
            </h2>
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
            {books.length > 0 ? (
              books.map((book, index) => (
                <BookCard
                  key={index}
                  book={book}
                  featured={book.featured ? true : false}
                />
              ))
            ) : (
              <div className="col-span-4 flex items-center justify-center min-h-[400px] text-gray-500 text-center">
                <p className="text-xl">Không tìm thấy sách nào</p>
              </div>
            )}
          </div>

          {books.length > 0 && (
            <Pagination
              page={page}
              total={total}
              limit={limit}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </>
  );
}
