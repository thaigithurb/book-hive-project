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
      <div className="min-h-screen py-12">
        <div className="container">
          <div className="bg-white rounded-2xl p-12 shadow text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Giỏ hàng trống
            </h1>
            <p className="text-slate-500 mb-8">
              Chưa có sản phẩm nào trong giỏ hàng của bạn
            </p>
            <Link
              href="/home"
              className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
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
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="container">
        <h1 className="text-4xl font-bold text-slate-800 mb-8">Giỏ hàng</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow p-6 flex gap-6 items-start hover:shadow-lg transition-shadow duration-200"
              >
                <Link
                  href={`/books/detail/${item.slug}`}
                  className="flex-shrink-0 w-24 h-32 bg-gray-100 rounded-lg overflow-hidden hover:opacity-80 transition-opacity duration-200"
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
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      Không tìm thấy ảnh
                    </div>
                  )}
                </Link>

                <Link
                  href={`/books/detail/${item.slug}`}
                  className="flex-1 hover:opacity-80 transition-opacity duration-200"
                >
                  <h3 className="text-lg font-bold text-slate-800 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-primary font-bold text-xl mb-4">
                    {item.price.toLocaleString("vi-VN")} đ
                  </p>
                </Link>

                <div className="flex flex-col gap-3 items-end">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      removeFromCart(item.bookId, item.type);
                      toast.info("Đã xóa khỏi giỏ hàng");
                    }}
                    className="flex-shrink-0 cursor-pointer px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200 font-semibold"
                  >
                    🗑️ Xóa
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        updateQuantity(
                          item.bookId,
                          Math.max(1, item.quantity - 1),
                          item.type,
                        );
                      }}
                      className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-md transition-colors duration-200 font-bold text-slate-700"
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
                      className="w-12 h-8 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
                      className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-md transition-colors duration-200 font-bold text-slate-700"
                    >
                      +
                    </button>
                  </div>

                  <p className="text-sm text-slate-500 whitespace-nowrap">
                    Tổng: {(item.price * item.quantity).toLocaleString("vi-VN")}{" "}
                    đ
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-40">
              <h2 className="text-xl font-bold text-slate-800 mb-6">
                Tóm tắt đơn hàng
              </h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-slate-600">
                  <span>Số lượng sản phẩm:</span>
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
                  <span>Phí vận chuyển:</span>
                  <span className="font-semibold text-green-600">Miễn phí</span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className="text-lg font-bold text-slate-800">Tổng:</span>
                <span className="text-2xl font-bold text-primary">
                  {totalPrice.toLocaleString("vi-VN")} đ
                </span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-blue-700 transition-colors duration-200 mb-3 active:scale-95"
              >
                💳 Thanh toán
              </button>

              <Link
                href="/home"
                className="block w-full py-3 bg-gray-100 text-slate-800 font-bold rounded-lg hover:bg-gray-200 transition-colors duration-200 text-center"
              >
                ← Tiếp tục mua sắm
              </Link>

              <div className="mt-6 pt-6 border-t border-gray-200 text-sm text-slate-500">
                <p className="mb-2">✓ Giao hàng toàn quốc</p>
                <p className="mb-2">✓ Đổi trả trong 30 ngày</p>
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
