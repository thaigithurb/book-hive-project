"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { FaStar } from "react-icons/fa";

interface ReviewListProps {
  bookId: string;
  refreshTrigger: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const REVIEWS_PER_PAGE = 5;

export default function ReviewList({
  bookId,
  refreshTrigger,
  currentPage,
  onPageChange,
}: ReviewListProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [bookId, refreshTrigger, currentPage]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews/${bookId}`,
        {
          params: {
            page: currentPage,
            limit: REVIEWS_PER_PAGE,
          },
        },
      );
      setReviews(response.data.records);
      setTotalReviews(response.data.total);
    } catch (error) {
      console.error("Lỗi khi tải đánh giá:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalReviews / REVIEWS_PER_PAGE);

  if (loading) {
    return <div className="text-center py-4 text-slate-500">Đang tải...</div>;
  }

  return (
    <div>
      {reviews.length === 0 ? (
        <p className="text-slate-500 text-center py-4">Chưa có đánh giá nào</p>
      ) : (
        <>
          <div className="space-y-4 mb-6 md:mb-8">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-slate-800 text-sm md:text-base">
                    {review.user?.fullName || "Ẩn danh"}
                  </h3>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-sm md:text-base ${
                          i < review.rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      >
                        <FaStar />
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                  {review.comment}
                </p>
                <p className="text-slate-400 text-xs md:text-sm mt-2">
                  {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 cursor-pointer py-2 text-sm md:text-base border border-gray-300 rounded-lg text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
              >
                ←
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`cursor-pointer px-3 py-2 text-sm md:text-base rounded-lg transition ${
                      currentPage === page
                        ? "bg-secondary1 text-white"
                        : "border border-gray-300 text-slate-700 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                onClick={() =>
                  onPageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="cursor-pointer px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
              >
                →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
