"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useCart } from "@/contexts/CartContext";
import { Loading } from "@/app/components/Loading/Loading";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PaymentPage() {
  const router = useRouter();
  const { clearCart } = useCart();
  const [isLoaded, setIsLoaded] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string>("");
  const [orderCode, setOrderCode] = useState<string>("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [orderItems, setOrderItems] = useState<any[]>([]);

  const hasInitialized = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ Khởi tạo khi vào trang
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const init = async () => {
      try {
        const savedOrderCode = sessionStorage.getItem("orderCode");

        if (!savedOrderCode) {
          router.replace("/cart");
          return;
        }

        setOrderCode(savedOrderCode);

        // ✅ Lấy thông tin order từ DB
        const response = await axios.get(
          `${API_URL}/api/v1/orders/detail/${savedOrderCode}`
        );
        const order = response.data.order;

        const now = new Date();
        const expiredAt = new Date(order.expiredAt);

        // ❌ Kiểm tra hết hạn
        if (now > expiredAt || order.isExpired) {
          toast.error("❌ Đơn hàng đã hết hạn!");
          sessionStorage.removeItem("orderCode");
          router.replace("/cart");
          return;
        }

        // ✅ Đã thanh toán
        if (order.status === "paid") {
          toast.success("✅ Đơn hàng đã thanh toán!");
          sessionStorage.removeItem("orderCode");
          clearCart();
          router.replace("/order-success");
          return;
        }

        // ❌ Đã hủy
        if (order.status === "cancelled") {
          toast.error("❌ Đơn hàng đã bị hủy!");
          sessionStorage.removeItem("orderCode");
          router.replace("/cart");
          return;
        }

        // ⏱️ Set thời gian còn lại
        const timeRemaining = Math.floor(
          (expiredAt.getTime() - now.getTime()) / 1000
        );
        setTimeLeft(Math.max(0, timeRemaining));
        setTotalAmount(order.totalAmount);
        setOrderItems(order.items);

        // ✅ Nếu đã có checkoutUrl trong DB, dùng luôn
        if (order.checkoutUrl) {
          setCheckoutUrl(order.checkoutUrl);
          setIsLoaded(true);
          return;
        }

        // ✅ Chưa có thì tạo mới
        const paymentPayload = {
          orderCode: Number(savedOrderCode),
          amount: order.totalAmount,
          description: `Đơn hàng ${savedOrderCode}`,
          items: order.items.map((item: any) => ({
            name: item.title,
            quantity: item.quantity,
            price: item.price,
          })),
        };

        const paymentResponse = await axios.post(
          `${API_URL}/api/v1/payment/create`,
          paymentPayload
        );

        if (
          paymentResponse.data.error === 0 &&
          paymentResponse.data.data?.checkoutUrl
        ) {
          setCheckoutUrl(paymentResponse.data.data.checkoutUrl);
        }

        setIsLoaded(true);
      } catch (error: any) {
        console.error("❌ Lỗi khởi tạo:", error);
        toast.error("Có lỗi xảy ra!");
        router.replace("/cart");
      }
    };

    init();
  }, [router, clearCart]);

  // ✅ Đếm ngược thời gian
  useEffect(() => {
    if (!isLoaded || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // ⏱️ Hết giờ - Hủy đơn
          const cancelOrder = async () => {
            try {
              await axios.post(`${API_URL}/api/v1/payment/cancel/${orderCode}`);
            } catch (err) {
              console.error("❌ Lỗi hủy đơn:", err);
            }
          };

          cancelOrder();
          sessionStorage.removeItem("orderCode");
          clearCart();
          toast.warning("⏱️ Hết thời gian thanh toán!");
          router.replace("/cart");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLoaded, timeLeft, orderCode, router, clearCart]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleCancel = async () => {
    try {
      await axios.post(`${API_URL}/api/v1/payment/cancel/${orderCode}`);
      sessionStorage.removeItem("orderCode");
      toast.info("Đã hủy đơn hàng");
      router.replace("/cart");
    } catch (error) {
      console.error("❌ Lỗi hủy:", error);
      sessionStorage.removeItem("orderCode");
      router.replace("/cart");
    }
  };

  if (!isLoaded) {
    return (
      <Loading fullScreen={true} size="lg" text="Đang kiểm tra đơn hàng..." />
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="container max-w-2xl">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Thanh toán
            </h1>
            <p className="text-slate-600">
              Mã đơn hàng: <span className="font-bold">{orderCode}</span>
            </p>

            <div
              className={`mt-4 p-3 rounded-lg font-bold text-lg ${
                timeLeft < 60
                  ? "bg-red-100 text-red-600"
                  : "bg-yellow-100 text-yellow-600"
              }`}
            >
              ⏱️ Thời gian còn lại: {formatTime(timeLeft)}
            </div>
          </div>

          <div className="mb-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-slate-600 mb-2">Tổng tiền:</p>
            <p className="text-3xl font-bold text-blue-600">
              {formatCurrency(totalAmount)}
            </p>
          </div>

          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-semibold text-slate-700 mb-3">
              📦 Chi tiết đơn hàng:
            </p>
            <div className="space-y-2">
              {orderItems.length > 0 ? (
                orderItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-sm text-slate-600"
                  >
                    <span>{item.title}</span>
                    <span>
                      x{item.quantity} ={" "}
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500">Đang tải...</p>
              )}
            </div>
          </div>

          {checkoutUrl ? (
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-center text-lg mb-4"
            >
              🔗 Thanh toán ngay
            </a>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-600">⏳ Đang tạo link thanh toán...</p>
            </div>
          )}

          <button
            onClick={handleCancel}
            className="w-full py-3 bg-gray-200 text-slate-800 font-bold rounded-lg hover:bg-gray-300 transition-colors"
          >
            ← Hủy và quay lại
          </button>
        </div>
      </div>

      <ToastContainer autoClose={1500} hideProgressBar pauseOnHover={false} />
    </div>
  );
}
