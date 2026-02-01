"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Book } from "@/app/interfaces/book.interface";
import { BookCard } from "@/app/components/Card/BookCard";
import { BookCardSkeleton } from "@/app/components/Skeleton/BookCardSkeleton";
import { ToastContainer } from "react-toastify";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function HomeClient({
  featuredBooks,
  newestBooks,
}: {
  featuredBooks: Book[];
  newestBooks: Book[];
}) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken_user");
    setIsLoggedIn(!!token);
    if (!token) {
      setIsLoading(false);
      return;
    }
    axios
      .get(`${API_URL}/api/v1/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const favorites = res.data.favorites || [];
        setFavoriteIds(favorites.map((fav: any) => fav.bookId?._id));
      })
      .catch(() => setFavoriteIds([]))
      .finally(() => setIsLoading(false));
  }, []);

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

  return (
    <>
      <div className="py-4 px-4 md:py-[32px] md:px-[24px]">
        <div className="container mx-auto">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-primary">
              Sách nổi bật
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-[24px] mb-10">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <BookCardSkeleton key={i} />
                  ))
                : featuredBooks
                    .slice(0, 8)
                    .map((book, index) => (
                      <BookCard
                        key={index}
                        book={book}
                        featured={true}
                        newest={false}
                        isFavorite={favoriteIds.includes(book._id)}
                        onToggleFavorite={handleToggleFavorite}
                        isLoggedIn={isLoggedIn}
                      />
                    ))}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4 text-primary">Sách mới</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-[24px] mb-10">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <BookCardSkeleton key={i} />
                  ))
                : newestBooks
                    .slice(0, 8)
                    .map((book, index) => (
                      <BookCard
                        key={index}
                        book={book}
                        featured={false}
                        newest={true}
                        isFavorite={favoriteIds.includes(book._id)}
                        onToggleFavorite={handleToggleFavorite}
                        isLoggedIn={isLoggedIn}
                      />
                    ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
