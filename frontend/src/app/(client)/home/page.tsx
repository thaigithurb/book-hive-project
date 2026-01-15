"use client";

import { useEffect, useState } from "react";

import axios from "axios";
import { Book } from "@/app/interfaces/book.interface";
import { BookCard } from "@/app/components/Card/BookCard/BookCard";
import { Loading } from "@/app/components/Loading/Loading";
import { ToastContainer } from "react-toastify";

export default function Home() {
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [newestBooks, setNewestBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, newestRes] = await Promise.all([
          axios.get("http://localhost:3001/api/v1/books/featured"),
          axios.get("http://localhost:3001/api/v1/books/newest"),
        ]);

        setFeaturedBooks(featuredRes.data.books);
        setNewestBooks(newestRes.data.books);
      } catch (error) {
        setFeaturedBooks([]);
        setNewestBooks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <Loading fullScreen={true} size="lg" text="Đang tải..." />;
  }

  return (
    <>
      <div className="py-[32px] px-[24px]">
        <div className="container">
          <div className="">
            <h2 className="text-2xl font-bold mb-4 text-primary">
              Sách nổi bật
            </h2>
            <div className="grid grid-cols-4 gap-[24px] mb-10">
              {featuredBooks.slice(0, 8).map((book, index) => (
                <BookCard
                  key={index}
                  book={book}
                  featured={true}
                  newest={false}
                />
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4 text-primary">Sách mới</h2>
            <div className="grid grid-cols-4 gap-[24px] mb-10">
              {newestBooks.slice(0, 8).map((book, index) => (
                <BookCard
                  key={index}
                  book={book}
                  featured={false}
                  newest={true}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer
        autoClose={1500}
        hideProgressBar={true}
        pauseOnHover={false}
      />
    </>
  );
}
