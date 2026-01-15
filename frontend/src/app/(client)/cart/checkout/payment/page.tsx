"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useCart } from "@/contexts/CartContext";
import { Loading } from "@/app/components/Loading/Loading";
import axios from "axios";

export default function PaymentPage() {
  const router = useRouter();
  const { items } = useCart();
  const [isLoaded, setIsLoaded] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string>("");
  const [orderCode, setOrderCode] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    setIsLoaded(true);

    const savedOrderCode = sessionStorage.getItem("orderCode");

    if (!savedOrderCode) {
      toast.error("Không tìm thấy đơn hàng!");
      router.push("/cart");
      return;
    }

    console.log("📋 Saved orderCode:", savedOrderCode);
    setOrderCode(savedOrderCode);
  }, [router]);

  useEffect(() => {
    if (!orderCode || items.length === 0 || isCreating) return;

    const amount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    console.log("💰 Calculated amount:", amount);
    console.log("📦 Items:", items);

    setTotalAmount(amount);

    createPaymentLink(Number(orderCode), amount);
  }, [orderCode, items]);

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
        "http://localhost:3001/api/v1/payments/create",
        paymentPayload
      );


      if (response.data.error === 0 && response.data.data?.checkoutUrl) {
        setCheckoutUrl(response.data.data.checkoutUrl);
        toast.success("✅ Tạo link thanh toán thành công!");
      } else {
        toast.error(response.data.message || "Không tạo được link thanh toán!");
      }
    } catch (err: any) {
      console.error("❌ Error:", err);
      toast.error(err.response?.data?.details || "Lỗi tạo link thanh toán!");
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

  if (!isLoaded) {
    return <Loading fullScreen={true} size="lg" text="Đang tải..." />;
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
          </div>

          {/* ✅ Hiển thị tổng tiền */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-slate-600 mb-2">Tổng tiền:</p>
            <p className="text-3xl font-bold text-blue-600">
              {formatCurrency(totalAmount)}
            </p>
          </div>

          {/* ✅ Hiển thị chi tiết đơn hàng */}
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

          {/* ✅ Button thanh toán */}
          {isCreating ? (
            <div className="text-center py-8">
              <p className="text-slate-600">⏳ Đang tạo link thanh toán...</p>
            </div>
          ) : checkoutUrl ? (
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-center text-lg"
            >
              🔗 Bấm vào để thanh toán
            </a>
          ) : (
            <div className="text-center py-8">
              <p className="text-red-600">❌ Không tạo được link thanh toán</p>
            </div>
          )}
        </div>
      </div>

      <ToastContainer autoClose={1500} hideProgressBar pauseOnHover={false} />
    </div>
  );
}
