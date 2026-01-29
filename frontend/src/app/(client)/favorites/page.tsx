"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Book } from "@/app/interfaces/book.interface";
import { Loading } from "@/app/components/Loading/Loading";
import Pagination from "@/app/components/Pagination/Pagination";
import { FavoriteCard } from "@/app/components/Card/FavoriteCard";
import { useSyncParams } from "@/app/utils/useSyncParams";
import { usePageChange } from "@/app/utils/usePageChange";
import { AiOutlineDelete } from "react-icons/ai";
import { toast, ToastContainer } from "react-toastify";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Favorite {
  _id: string;
  bookId: Book;
}

const limit = 6;

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState<{ key: string; value: 1 | -1 } | null>(null);
  const [sortValue, setSortValue] = useState("");

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken_user");
      const res = await axios.get(
        `${API_URL}/api/v1/favorites?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setFavorites(res.data.favorites || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      setFavorites([]);
      setTotal(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFavorites();
  }, [page]);

  useSyncParams(setPage, setSortValue, setSort);
  const handlePageChange = usePageChange("favorites", setPage, "client");

  const handleRemoveFavorite = async (bookId: string) => {
    const token = localStorage.getItem("accessToken_user");
    if (!token) return;
    try {
      await axios.post(
        `${API_URL}/api/v1/favorites/remove`,
        { bookId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Đã xóa khỏi mục yêu thích");
      setTimeout(() => {
        fetchFavorites();
      }, 1000);
    } catch (err) {
      toast.error("Lỗi xóa khỏi mục yêu thích");
    }
  };

  return (
    <>
      <div className="min-h-[calc(100vh-64px-56px)] bg-[#f8fafc] py-8 flex flex-col">
        <div className="container mx-auto flex-1 flex flex-col">
          <h2 className="text-2xl font-bold mb-6">
            Sản phẩm yêu thích của bạn
          </h2>
          {loading ? (
            <Loading />
          ) : favorites.length === 0 ? (
            <div className="min-h-[400px] flex items-center justify-center text-gray-500">
              Bạn chưa thêm sản phẩm nào vào mục yêu thích.
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {favorites.map((fav) => (
                  <div key={fav._id} className="relative group">
                    <FavoriteCard book={fav.bookId} />
                    <button
                      className="absolute top-4 cursor-pointer right-4 z-20 bg-red-500 text-white rounded-full p-2 shadow hover:bg-red-600 transition-all flex items-center gap-1"
                      title="Xóa khỏi yêu thích"
                      onClick={() => handleRemoveFavorite(fav.bookId._id)}
                    >
                      <AiOutlineDelete size={20} />
                      <span className="hidden sm:inline text-sm font-medium">
                        Xóa
                      </span>
                    </button>
                  </div>
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
      <ToastContainer
        autoClose={1500}
        hideProgressBar={true}
        pauseOnHover={false}
      />
    </>
  );
}
