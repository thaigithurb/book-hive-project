"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type ReviewListProps = {
  bookId: string;
  refreshTrigger?: number;
};

export default function ReviewList({
  bookId,
  refreshTrigger,
}: ReviewListProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoadingReviews(true);
        const response = await axios.get(`${API_URL}/api/v1/reviews/${bookId}`);
        setReviews(response.data.records || []);
      } catch (error) {
        console.error("Lỗi khi lấy đánh giá:", error);
        setReviews([]);
      } finally {
        setIsLoadingReviews(false);
      }
    };

    if (bookId) {
      fetchReviews();
    }
  }, [bookId, refreshTrigger]);

  return (
    <div>
      <h3 className="text-lg md:text-xl font-semibold mb-4 text-slate-800">
        Tất cả đánh giá ({reviews.length})
      </h3>

      {isLoadingReviews ? (
        <p className="text-center text-slate-400 py-8">Đang tải...</p>
      ) : reviews.length === 0 ? (
        <p className="text-center text-slate-400 text-sm md:text-base py-8">
          Chưa có đánh giá nào
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary1 text-white flex items-center justify-center font-bold text-sm">
                    {review.user?.fullName?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm md:text-base">
                      {review.user?.fullName || "Khách hàng"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-lg ${
                      i < review.rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p className="text-slate-700 text-sm md:text-base leading-relaxed">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
