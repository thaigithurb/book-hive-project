"use client";

import { useEffect, useState } from "react";

import axios from "axios";
import { Book } from "@/app/interfaces/book.interface";
import { BookCard } from "@/app/components/Card/BookCard";
import { Loading } from "@/app/components/Loading/Loading";
import { ToastContainer } from "react-toastify";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [newestBooks, setNewestBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem("accessToken_user");
        if (!token) return;
        const res = await axios.get(`${API_URL}/api/v1/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const favorites = res.data.favorites || [];
        setFavoriteIds(favorites.map((fav: any) => fav.bookId?._id));
      } catch {
        setFavoriteIds([]);
      }
    };
    fetchFavorites();
  }, []);

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
        await axios.delete(`${API_URL}/api/v1/favorites/remove`, {
          data: { bookId },
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavoriteIds((prev) => prev.filter((id) => id !== bookId));
      }
    } catch (err) {}
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, newestRes] = await Promise.all([
          axios.get(`${API_URL}/api/v1/books/featured`),
          axios.get(`${API_URL}/api/v1/books/newest`),
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
                  isFavorite={favoriteIds.includes(book._id)}
                  onToggleFavorite={handleToggleFavorite}
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
                  isFavorite={favoriteIds.includes(book._id)}
                  onToggleFavorite={handleToggleFavorite}
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
