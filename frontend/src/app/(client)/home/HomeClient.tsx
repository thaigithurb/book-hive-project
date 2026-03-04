"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Book } from "@/app/interfaces/book.interface";
import { BookCard } from "@/app/components/Card/BookCard";
import { BookCardSkeleton } from "@/app/components/Skeleton/BookCardSkeleton";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function HomeClient({
  featuredBooks,
  newestBooks,
  bestSellerBooks,
}: {
  featuredBooks: Book[];
  newestBooks: Book[];
  bestSellerBooks: Book[];
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
          <div className="mb-8 md:mb-12 rounded-2xl overflow-hidden shadow-lg relative group">
            <img
              src="/book-hive-banner.jpg"
              alt="Book Hive Banner"
              className="w-full h-auto object-cover"
            />
            <Link
              href="/books"
              className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-white/20 backdrop-blur-md text-white px-4 md:px-8 py-2 md:py-4 text-[10px] md:text-[18px] rounded-lg font-semibold border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Khám phá ngay
            </Link>
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
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-primary">
              Bán chạy nhất
            </h2>
            <Swiper
              slidesPerView={4}
              spaceBetween={30}
              freeMode={true}
              pagination={{
                clickable: true,
              }}
              modules={[FreeMode, Pagination]}
              className="mySwiper"
            >
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <SwiperSlide key={i}>
                      <BookCardSkeleton />
                    </SwiperSlide>
                  ))
                : bestSellerBooks.map((book, index) => (
                    <SwiperSlide key={index}>
                      <BookCard
                        book={book}
                        featured={false}
                        newest={false}
                        bestSeller={true}
                        isFavorite={favoriteIds.includes(book._id)}
                        onToggleFavorite={handleToggleFavorite}
                        isLoggedIn={isLoggedIn}
                      />
                    </SwiperSlide>
                  ))}
              <SwiperSlide>
                <div className="flex items-center justify-center h-full min-h-[300px]">
                  <Link
                    href="/books"
                    className="flex gap-2 items-center justify-center px-6 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <span className="text-sm font-semibold">Xem thêm</span>
                    <span className="text-xl">→</span>
                  </Link>
                </div>
              </SwiperSlide>
            </Swiper>
          </div>

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
        </div>
      </div>
    </>
  );
}
