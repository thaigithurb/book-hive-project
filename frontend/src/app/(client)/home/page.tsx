"use client";

import { useEffect, useState } from "react";

import axios from "axios";
import { Book } from "@/app/interfaces/book.interface";
import { BookCard } from "@/app/components/BookCard/BookCard";


export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/v1/home")
      .then((res) => {
        setBooks(res.data.books);
      })
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="py-[32px] px-[24px]">
        <div className="container">
          <div className="grid grid-cols-3 gap-[24px]">
            {loading ? (
              <div>Đang tải...</div>
            ) : (
              books.map((book, index) => <BookCard key={index} book={book} />)
            )}
          </div>
        </div>
      </div>
    </>
  );
}
