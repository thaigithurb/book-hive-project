"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Book } from "@/app/interfaces/book.interface";
import { BookCard } from "@/app/components/Card/BookCard";
import debounce from "lodash.debounce";
import Pagination from "@/app/components/Pagination/Pagination";
import SortSelect from "@/app/components/SortSelect/SortSelect";
import { useSyncParams } from "@/app/utils/useSyncParams";
import { usePageChange } from "@/app/utils/usePageChange";
import { useSortChange } from "@/app/utils/useSortChange";
import { BookCardSkeleton } from "@/app/components/Skeleton/BookCardSkeleton";
import { useFetchFavorites } from "@/app/utils/useFetchFavorites";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function BooksRent() {
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
    { value: "priceRentDay_asc", label: "Giá thuê tăng" },
    { value: "priceRentDay_desc", label: "Giá thuê giảm" },
    { value: "createdAt_desc", label: "Mới nhất" },
    { value: "createdAt_asc", label: "Cũ nhất" },
  ];

  const { favoriteIds, setFavoriteIds, isLoggedIn } = useFetchFavorites();

  // Xử lý toggle favorite
  const handleToggleFavorite = async (bookId: string, next: boolean) => {
    const token = localStorage.getItem("accessToken_user");
    if (!token) return;
    try {
      if (next) {
        await axios.post(
          `${API_URL}/api/v1/favorites/add`,
          { bookId },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setFavoriteIds((prev) => [...prev, bookId]);
      } else {
        await axios.post(
          `${API_URL}/api/v1/favorites/remove`,
          { bookId },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setFavoriteIds((prev) => prev.filter((id) => id !== bookId));
      }
    } catch (err) {}
  };

  const fetchData = useCallback(
    debounce(() => {
      setBooks([]);
      setLoading(true);
      axios
        .get(`${API_URL}/api/v1/books/rent-only`, {
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
        .catch(() => setBooks([]))
        .finally(() => {
          setLoading(false);
        });
    }, 400),
    [sort, keyword, page],
  );

  useEffect(() => {
    fetchData();
    return fetchData.cancel;
  }, [fetchData]);

  useSyncParams(setPage, setSortValue, setSort);
  const handlePageChange = usePageChange("books/rent-only", setPage, "client");
  const handleSortChange = useSortChange("books/rent-only", "client");

  return (
    <>
      <div className="py-[32px] px-[24px]">
        <div className="container">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold mb-4 text-primary">
              Sách chỉ thuê
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
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <BookCardSkeleton key={i} />
              ))
            ) : books.length > 0 ? (
              books.map((book, index) => (
                <BookCard
                  key={index}
                  book={book}
                  featured={book.featured ? true : false}
                  onToggleFavorite={handleToggleFavorite}
                  isLoggedIn={isLoggedIn}
                  isFavorite={favoriteIds.includes(book._id)}
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
