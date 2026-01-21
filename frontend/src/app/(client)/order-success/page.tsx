"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderCode, setOrderCode] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const code = searchParams.get("orderCode");

    if (code) {
      setOrderCode(parseInt(code, 10));
      setIsLoaded(true);
      toast.success("✅ Đặt hàng thành công!");

       const clearUserCart = async () => {
        try {
          const accessToken = localStorage.getItem("accessToken_user");
          if (accessToken) {
            await axios.delete(`${API_URL}/api/v1/cart/delete-all`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });
          }
        } catch (error) {
          console.error("Lỗi xóa cart:", error);
        }
      };

      clearUserCart();

      sessionStorage.removeItem("orderCode");
      sessionStorage.removeItem("paymentMethod");
      localStorage.removeItem("guest_cart");
    } else {
      toast.error("Không tìm thấy thông tin đơn hàng!");
      router.replace("/home");
    }
  }, [searchParams, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Đang tải...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4">
      <div className="container max-w-2xl">
        <div className="bg-white rounded-lg shadow-2xl p-8 text-center">
          <div className="text-7xl mb-6 animate-bounce">✅</div>

          <h1 className="text-4xl font-bold text-green-600 mb-4">
            Đặt Hàng Thành Công!
          </h1>

          <p className="text-xl text-slate-600 mb-8">
            Cảm ơn bạn đã mua sắm tại BookHive 📚
          </p>

          {orderCode && (
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 mb-8">
              <p className="text-sm text-slate-600 mb-3">
                Mã đơn hàng của bạn:
              </p>
              <div className="flex items-center justify-center gap-3">
                <p className="text-3xl font-bold text-green-600 font-mono">
                  {orderCode}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(orderCode.toString());
                    toast.success("Đã sao chép mã đơn hàng!");
                  }}
                  className="text-green-700 cursor-pointer hover:text-green-900 text-2xl transition-colors"
                  title="Sao chép"
                >
                  📋
                </button>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-8 text-left">
            <h3 className="font-bold text-blue-900 mb-4 text-lg">
              📋 Thông tin đơn hàng:
            </h3>
            <ul className="text-sm text-blue-800 space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-lg">✓</span>
                <span>Đơn hàng đã được tạo và thanh toán thành công</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-lg">✓</span>
                <span>Chúng tôi sẽ xác nhận đơn hàng trong 24 giờ</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-lg">✓</span>
                <span>Hàng sẽ được gửi trong 3-5 ngày làm việc</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-lg">✓</span>
                <span>Bạn sẽ nhận email xác nhận và mã vận chuyển</span>
              </li>
            </ul>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mb-8">
            <p className="text-sm text-yellow-800">
              <span className="font-bold">💡 Tip:</span> Lưu mã đơn hàng để theo
              dõi đơn hàng của bạn
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/home"
              className="py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors text-center"
            >
              🏠 Quay về trang chủ
            </Link>
            <Link
              href="/books"
              className="py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              📚 Tiếp tục mua sắm
            </Link>
          </div>

          <p className="text-xs text-slate-500 mt-6 p-3 bg-gray-100 rounded">
            Nếu có bất kỳ câu hỏi nào, vui lòng liên hệ: support@bookhive.com
          </p>
        </div>
      </div>

      <ToastContainer
        autoClose={2000}
        hideProgressBar={true}
        pauseOnHover={false}
      />
    </div>
  );
}
