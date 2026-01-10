"use client";

import { useEffect, useState } from "react";

import axios from "axios";
import { Book } from "@/app/interfaces/book.interface";
import { BookCard } from "@/app/components/Card/BookCard/BookCard";

export default function Home() {
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/v1/books/featured")
      .then((res) => {
        setFeaturedBooks(res.data.books);
      })
      .catch(() => setFeaturedBooks([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="py-[32px] px-[24px]">
        <div className="container">
          <h2 className="text-2xl font-bold mb-4 text-primary">Sách nổi bật</h2>
          <div className="grid grid-cols-4 gap-[24px] mb-8">
            {loading ? (
              <div className="text-gray-500 text-center col-span-3">Đang tải...</div>
            ) : (
              featuredBooks.slice(0, 8).map((book, index) => (
                <BookCard key={index} book={book} featured={true} />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
