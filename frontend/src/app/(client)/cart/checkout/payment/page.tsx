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
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    orderCode: "",
    checkoutUrl: "",
    totalAmount: 0,
    timeLeft: 0,
    items: [] as any[],
  });

  const initialized = useRef(false);
  const checkStatusInterval = useRef<any>(null);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      const orderCode = sessionStorage.getItem("orderCode");
      if (!orderCode) return router.replace("/cart");

      try {
        const { data: res } = await axios.get(
          `${API_URL}/api/v1/orders/detail/${orderCode}`
        );
        const order = res.order;

        const now = new Date();
        const expired = new Date(order.expiredAt);

        if (now > expired || order.isExpired || order.status === "cancelled") {
          toast.error("❌ Đơn hàng đã hết hạn!");
          sessionStorage.removeItem("orderCode");
          return router.replace("/cart");
        }

        if (order.status === "paid") {
          sessionStorage.removeItem("orderCode");
          clearCart();
          toast.success("✅ Đã thanh toán!");
          return router.replace("/order-success");
        }

        const timeRemaining = Math.floor(
          (expired.getTime() - now.getTime()) / 1000
        );
        setData({
          orderCode: order.orderCode,
          checkoutUrl: order.checkoutUrl || "",
          totalAmount: order.totalAmount,
          timeLeft: Math.max(0, timeRemaining),
          items: order.items,
        });

        if (!order.checkoutUrl) {
          const { data: payment } = await axios.post(
            `${API_URL}/api/v1/payment/create`,
            {
              orderCode: Number(orderCode),
              amount: order.totalAmount,
              description: `${orderCode}`,
              items: order.items.map((item: any) => ({
                name: item.title,
                quantity: item.quantity,
                price: item.price,
              })),
            }
          );

          if (payment.data?.checkoutUrl) {
            setData((prev) => ({
              ...prev,
              checkoutUrl: payment.data.checkoutUrl,
            }));
          }
        }

        setLoading(false);

        checkStatusInterval.current = setInterval(async () => {
          try {
            const { data: checkRes } = await axios.get(
              `${API_URL}/api/v1/orders/detail/${orderCode}`
            );

            if (checkRes.order.status === "paid") {
              if (checkStatusInterval.current) {
                clearInterval(checkStatusInterval.current);
              }
              sessionStorage.removeItem("orderCode");
              clearCart();
              toast.success("✅ Thanh toán thành công!");

              router.replace("/order-success");
            }
          } catch (err) {
            console.error("Lỗi check status:", err);
          }
        }, 3000);
      } catch (error) {
        console.error("❌ Lỗi:", error);
        toast.error("Có lỗi xảy ra!");
        router.replace("/cart");
      }
    };

    init();

    return () => {
      if (checkStatusInterval.current) {
        clearInterval(checkStatusInterval.current);
      }
    };
  }, [router, clearCart]);

  useEffect(() => {
    if (loading || data.timeLeft <= 0) return;

    const timer = setInterval(() => {
      setData((prev) => {
        const newTime = prev.timeLeft - 1;

        if (newTime <= 0) {
          if (checkStatusInterval.current) {
            clearInterval(checkStatusInterval.current);
          }
          axios
            .post(`${API_URL}/api/v1/payment/cancel/${prev.orderCode}`)
            .catch(console.error);
          sessionStorage.removeItem("orderCode");
          clearCart();
          toast.warning("⏱️ Hết thời gian!");
          router.replace("/cart");
          return prev;
        }

        return { ...prev, timeLeft: newTime };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, data.timeLeft, router, clearCart]);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && data.orderCode) {
        try {
          const { data: res } = await axios.get(
            `${API_URL}/api/v1/orders/detail/${data.orderCode}`
          );

          if (res.order.status === "paid") {
            if (checkStatusInterval.current) {
              clearInterval(checkStatusInterval.current);
            }
            sessionStorage.removeItem("orderCode");
            clearCart();
            toast.success("✅ Thanh toán thành công!");

            router.replace("/order-success");
          }
        } catch (err) {
          console.error(err);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [data.orderCode, clearCart, router]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const formatMoney = (n: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(n);

  const handleCancel = async () => {
    if (checkStatusInterval.current) {
      clearInterval(checkStatusInterval.current);
    }
    await axios
      .post(`${API_URL}/api/v1/payment/cancel/${data.orderCode}`)
      .catch(console.error);
    sessionStorage.removeItem("orderCode");
    toast.info("Đã hủy");
    router.replace("/cart");
  };

  if (loading) return <Loading fullScreen size="lg" text="Đang kiểm tra..." />;

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="container max-w-2xl">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Thanh toán
            </h1>
            <p className="text-slate-600">
              Mã: <span className="font-bold">{data.orderCode}</span>
            </p>
            <div
              className={`mt-4 p-3 rounded-lg font-bold text-lg ${
                data.timeLeft < 60
                  ? "bg-red-100 text-red-600"
                  : "bg-yellow-100 text-yellow-600"
              }`}
            >
              ⏱️ {formatTime(data.timeLeft)}
            </div>
          </div>

          <div className="mb-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-slate-600 mb-2">Tổng tiền:</p>
            <p className="text-3xl font-bold text-blue-600">
              {formatMoney(data.totalAmount)}
            </p>
          </div>

          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-semibold text-slate-700 mb-3">
              📦 Sản phẩm:
            </p>
            {data.items.map((item, i) => (
              <div
                key={i}
                className="flex justify-between text-sm text-slate-600 mb-1"
              >
                <span>{item.title}</span>
                <span>
                  x{item.quantity} = {formatMoney(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {data.checkoutUrl ? (
            <a
              href={data.checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 text-center text-lg mb-4"
            >
              🔗 Thanh toán ngay
            </a>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-600">⏳ Đang tạo link...</p>
            </div>
          )}

          <button
            onClick={handleCancel}
            className="w-full py-3 bg-gray-200 text-slate-800 font-bold rounded-lg hover:bg-gray-300"
          >
            ← Hủy và quay lại
          </button>
        </div>
      </div>

      <ToastContainer autoClose={1500} hideProgressBar pauseOnHover={false} />
    </div>
  );
}
