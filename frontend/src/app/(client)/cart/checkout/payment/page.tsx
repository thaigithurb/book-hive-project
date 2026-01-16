"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useCart } from "@/contexts/CartContext";
import { Loading } from "@/app/components/Loading/Loading";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PaymentPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const [isLoaded, setIsLoaded] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string>("");
  const [orderCode, setOrderCode] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    const savedOrderCode = sessionStorage.getItem("orderCode");

    if (!savedOrderCode) {
      router.replace("/cart");
      return;
    }

    checkOrderStatus(savedOrderCode);
    setOrderCode(savedOrderCode);
    setIsLoaded(true);
  }, [router]);

  const checkOrderStatus = async (code: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/v1/orders/detail/${code}`
      );
      const order = response.data.order;

      if (new Date() > new Date(order.expiredAt)) {
        toast.error("❌ Link thanh toán đã hết hạn!");
        sessionStorage.removeItem("orderCode");
        router.replace("/cart");
        return;
      }

      if (order.status === "paid") {
        toast.success("✅ Đơn hàng đã được thanh toán!");
        sessionStorage.removeItem("orderCode");
        router.replace("/order-success");
        return;
      }

      if (order.status === "cancelled") {
        toast.error("❌ Đơn hàng đã bị hủy!");
        sessionStorage.removeItem("orderCode");
        router.replace("/cart");
        return;
      }

      const timeRemaining = Math.floor(
        (new Date(order.expiredAt).getTime() - new Date().getTime()) / 1000
      );
      setTimeLeft(Math.max(0, timeRemaining));
    } catch (err: any) {
      console.error("Lỗi kiểm tra trạng thái:", err);
    }
  };

  useEffect(() => {
    if (!isLoaded || !orderCode) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          cancelPaymentLink();

          toast.error("⏱️ Hết thời gian thanh toán!");
          sessionStorage.removeItem("orderCode");
          clearCart();
          router.replace("/cart");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoaded, orderCode, router, clearCart]);

  useEffect(() => {
    if (!isLoaded || !orderCode) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          cancelPaymentLink();
          localStorage.removeItem("cart");
          sessionStorage.removeItem("orderCode");
          sessionStorage.removeItem("paymentMethod");
          clearCart();
          toast.warning("⏱️ Hết thời gian thanh toán!");
          router.replace("/cart");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoaded, orderCode, router, clearCart]);

  useEffect(() => {
    if (!orderCode || items.length === 0 || isCreating) return;

    const amount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotalAmount(amount);
    createPaymentLink(Number(orderCode), amount);
  }, [orderCode]);

  const createPaymentLink = async (code: number, amount: number) => {
    setIsCreating(true);

    try {
      const paymentPayload = {
        orderCode: code,
        amount: amount,
        description: `${code}`,
        items: items.map((item) => ({
          name: item.title,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      const response = await axios.post(
        "http://localhost:3001/api/v1/payment/create",
        paymentPayload
      );

      if (response.data.error === 0 && response.data.data?.checkoutUrl) {
        setCheckoutUrl(response.data.data.checkoutUrl);
      }
    } catch (err: any) {
      toast.error("Lỗi tạo link thanh toán!");
      console.error("❌ Error:", err);
    } finally {
      setIsCreating(false);
    }
  };

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

  if (!isLoaded) {
    return <Loading fullScreen={true} size="lg" text="Đang tải..." />;
  }

  // hủy link thanh toán
  const cancelPaymentLink = async () => {
    try {
      await axios.post(
        `http://localhost:3001/api/v1/payment/cancel/${orderCode}`
      );
      toast.info("Đã hủy link thanh toán");
    } catch (err: any) {
      console.error("❌ Lỗi hủy link:", err);
    }
  };

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
              {items.length > 0 ? (
                items.map((item) => (
                  <div
                    key={item.id}
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
                <p className="text-slate-500">Giỏ hàng trống</p>
              )}
            </div>
          </div>

          {isCreating ? (
            <div className="text-center py-8">
              <p className="text-slate-600">⏳ Đang tạo link thanh toán...</p>
            </div>
          ) : checkoutUrl ? (
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-center text-lg mb-4"
            >
              🔗 Bấm vào để thanh toán
            </a>
          ) : (
            <div className="text-center py-8">
              <p className="text-red-600">❌ Không tạo được link thanh toán</p>
            </div>
          )}

          <button
            onClick={() => {
              sessionStorage.removeItem("orderCode");
              router.replace("/cart");
            }}
            className="w-full py-3 bg-gray-200 text-slate-800 font-bold rounded-lg hover:bg-gray-300 transition-colors"
          >
            ← Quay lại giỏ hàng
          </button>
        </div>
      </div>

      <ToastContainer autoClose={1500} hideProgressBar pauseOnHover={false} />
    </div>
  );
}
