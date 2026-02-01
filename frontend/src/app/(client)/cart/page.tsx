"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import { useCart } from "@/contexts/CartContext";
import { Loading } from "@/app/components/Loading/Loading";
import Image from "next/image";

export default function CartPage() {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, isLoading } = useCart();

  if (isLoading) {
    return <Loading fullScreen={true} size="lg" text="Đang tải giỏ hàng..." />;
  }

  if (items.length === 0) {
    return (
      <div className="py-10 min-h-[500px] md:py-20">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow text-center">
            <div className="text-5xl md:text-6xl mb-4">🛒</div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
              Giỏ hàng trống
            </h1>
            <p className="text-sm md:text-base text-slate-500 mb-8">
              Chưa có sản phẩm nào trong giỏ hàng của bạn
            </p>
            <Link
              href="/home"
              className="inline-block px-5 py-2.5 md:px-6 md:py-3 bg-primary text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 text-sm md:text-base"
            >
              ← Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("Giỏ hàng trống!");
      return;
    }
    router.push("/cart/checkout");
  };

  return (
    <div className="min-h-screen py-6 md:py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl md:text-4xl font-bold text-slate-800 mb-6 md:mb-8">
          Giỏ hàng
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          <div className="lg:col-span-2 space-y-3 md:space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="relative bg-white rounded-lg shadow p-3 md:p-6 flex gap-3 md:gap-6 items-start hover:shadow-lg transition-shadow duration-200"
              >
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    removeFromCart(item.bookId, item.type);
                    toast.info("Đã xóa khỏi giỏ hàng");
                  }}
                  className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-600 sm:hidden z-10"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                <Link
                  href={`/books/detail/${item.slug}`}
                  className="flex-shrink-0 w-20 h-28 md:w-24 md:h-32 bg-gray-100 rounded-lg overflow-hidden hover:opacity-80 transition-opacity duration-200"
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-center text-gray-400">
                      No Image
                    </div>
                  )}
                </Link>

                <div className="flex flex-col sm:flex-row flex-1 w-full justify-between h-full min-h-[112px] sm:min-h-[128px]">
                  <Link
                    href={`/books/detail/${item.slug}`}
                    className="flex-1 hover:opacity-80 transition-opacity duration-200 pr-6 sm:pr-0"
                  >
                    <h3 className="text-sm md:text-lg font-bold text-slate-800 mb-1 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-primary font-bold text-base md:text-xl mb-2 sm:mb-4">
                      {item.price.toLocaleString("vi-VN")} đ
                    </p>
                  </Link>

                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-2 sm:gap-3 mt-auto sm:mt-0">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        removeFromCart(item.bookId, item.type);
                        toast.info("Đã xóa khỏi giỏ hàng");
                      }}
                      className="hidden sm:block flex-shrink-0 cursor-pointer px-3 py-1.5 md:px-4 md:py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200 font-semibold text-xs md:text-sm"
                    >
                      🗑️ Xóa
                    </button>

                    <div className="flex items-center gap-2 md:gap-3">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          updateQuantity(
                            item.bookId,
                            Math.max(1, item.quantity - 1),
                            item.type,
                          );
                        }}
                        className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-md transition-colors duration-200 font-bold text-slate-700 text-sm md:text-base"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 1;
                          if (value > 0) {
                            updateQuantity(item.bookId, value, item.type);
                          }
                        }}
                        className="w-8 h-6 md:w-12 md:h-8 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-xs md:text-sm"
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          updateQuantity(
                            item.bookId,
                            item.quantity + 1,
                            item.type,
                          );
                        }}
                        className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-md transition-colors duration-200 font-bold text-slate-700 text-sm md:text-base"
                      >
                        +
                      </button>
                    </div>

                    <p className="text-xs md:text-sm text-slate-500 whitespace-nowrap">
                      <span className="sm:hidden">Tổng: </span>
                      {(item.price * item.quantity).toLocaleString("vi-VN")} đ
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 md:p-6 sticky top-[80px] md:top-40">
              <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-4 md:mb-6">
                Tóm tắt đơn hàng
              </h2>

              <div className="space-y-2 md:space-y-3 mb-4 md:mb-6 pb-4 md:pb-6 border-b border-gray-200 text-sm md:text-base">
                <div className="flex justify-between text-slate-600">
                  <span>Số lượng:</span>
                  <span className="font-semibold">
                    {items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tạm tính:</span>
                  <span className="font-semibold">
                    {totalPrice.toLocaleString("vi-VN")} đ
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Vận chuyển:</span>
                  <span className="font-semibold text-green-600">Miễn phí</span>
                </div>
              </div>

              <div className="flex justify-between mb-4 md:mb-6">
                <span className="text-base md:text-lg font-bold text-slate-800">
                  Tổng:
                </span>
                <span className="text-xl md:text-2xl font-bold text-primary">
                  {totalPrice.toLocaleString("vi-VN")} đ
                </span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full cursor-pointer py-2.5 md:py-3 bg-primary text-white font-bold rounded-lg hover:bg-blue-700 transition-colors duration-200 mb-3 active:scale-95 text-sm md:text-base"
              >
                💳 Thanh toán
              </button>

              <Link
                href="/home"
                className="block w-full py-2.5 md:py-3 bg-gray-100 text-slate-800 font-bold rounded-lg hover:bg-gray-200 transition-colors duration-200 text-center text-sm md:text-base"
              >
                ← Tiếp tục mua sắm
              </Link>

              <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200 text-xs md:text-sm text-slate-500">
                <p className="mb-1 md:mb-2">✓ Giao hàng toàn quốc</p>
                <p className="mb-1 md:mb-2">✓ Đổi trả trong 30 ngày</p>
                <p>✓ Thanh toán an toàn</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer
        autoClose={1500}
        hideProgressBar={true}
        pauseOnHover={false}
      />
    </div>
  );
}
