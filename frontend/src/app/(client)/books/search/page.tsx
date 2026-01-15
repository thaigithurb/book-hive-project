"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { Book } from "@/app/interfaces/book.interface";
import { BookCard } from "@/app/components/Card/BookCard/BookCard";
import { Loading } from "@/app/components/Loading/Loading";
import Pagination from "@/app/components/Pagination/Pagination";
import { usePageChange } from "@/app/utils/usePageChange";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialPage = Number(searchParams.get("page")) || 1;
  const [page, setPage] = useState(initialPage);
  const keyword = searchParams.get("keyWord") || "";
  const limit = parseInt(searchParams.get("limit") || "12");

  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      if (!keyword.trim()) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const res = await axios.get("http://localhost:3001/api/v1/books", {
          params: {
            ...(keyword && { keyWord: keyword }),
            page,
            limit,
          },
        });

        setBooks(res.data.books || []);
        setTotal(res.data.total || 0);
      } catch (error) {
        setBooks([]);
        setTotal(0);
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [keyword, page, limit]);

  // hàm thay đổi trang
  const handlePageChange = usePageChange("books", setPage, "client");

  if (isLoading) {
    return <Loading fullScreen={true} size="lg" text="Đang tìm kiếm..." />;
  }

  return (
    <div className="py-[32px] px-[24px]">
      <div className="container">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Kết quả tìm kiếm
          </h1>
          <p className="text-gray-600">
            {keyword && `Từ khóa: "${keyword}"`}
            {total > 0
              ? ` - Tìm thấy ${total} sách`
              : " - Không tìm thấy sách nào"}
          </p>
        </div>

        {books.length > 0 ? (
          <>
            <div className="grid grid-cols-4 gap-[24px] mb-10">
              {books.map((book, index) => (
                <BookCard
                  key={index}
                  book={book}
                  featured={false}
                  newest={false}
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
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">
              Không tìm thấy sách nào phù hợp với từ khóa "{keyword}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
