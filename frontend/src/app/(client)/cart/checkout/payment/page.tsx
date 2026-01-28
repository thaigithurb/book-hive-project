"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { Loading } from "@/app/components/Loading/Loading";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PaymentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [codes, setCodes] = useState<string[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const initPayment = async () => {
      try {
        const storedCodes = sessionStorage.getItem("codes");
        const paymentMethod = sessionStorage.getItem("paymentMethod");

        if (!storedCodes || paymentMethod !== "transfer") {
          toast.error("Không có thông tin thanh toán!");
          setTimeout(() => router.push("/cart"), 2000);
          return;
        }

        const parsedCodes = JSON.parse(storedCodes);
        setCodes(parsedCodes);

        const storedTotal = sessionStorage.getItem("totalAmount");
        if (!storedTotal) {
          toast.error("Không tìm thấy tổng tiền đơn hàng!");
          setTimeout(() => router.push("/cart"), 2000);
          return;
        }
        const parsedTotal = Number(storedTotal);
        setTotalAmount(parsedTotal);
        setIsLoading(false);
      } catch (error) {
        toast.error("Có lỗi xảy ra!");
        setTimeout(() => router.push("/cart"), 2000);
      }
    };

    initPayment();
  }, [router]);

  const handleCreatePaymentLink = async () => {
    if (codes.length === 0) {
      toast.error("Không có đơn hàng để thanh toán!");
      return;
    }

    setIsCreatingLink(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/v1/payment/create-combined`,
        {
          codes: codes,
          amount: totalAmount,
          items: codes.map((code) => ({
            name: code,
            quantity: 1,
            price: totalAmount,
          })),
        },
      );

      if (response.data.error === 0 && response.data.data.checkoutUrl) {
        setPaymentLink(response.data.data.checkoutUrl);
        toast.success("Tạo link thanh toán thành công!");
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Lỗi tạo link thanh toán!";
      toast.error(errorMsg);
    } finally {
      setIsCreatingLink(false);
    }
  };

  const handlePayment = () => {
    if (paymentLink) {
      window.location.href = paymentLink;
    }
  };

  if (isLoading) {
    return <Loading fullScreen={true} size="lg" text="Đang tải..." />;
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="container max-w-2xl">
        <h1 className="text-4xl font-bold text-slate-800 mb-8">
          Thanh toán đơn hàng
        </h1>

        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            Thông tin đơn hàng
          </h2>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between pb-3 border-b border-gray-200">
              <span className="text-slate-600">Số lượng đơn:</span>
              <span className="font-semibold text-slate-800">
                {codes.length}
              </span>
            </div>

            <div className="flex justify-between pb-3 border-b border-gray-200">
              <span className="text-slate-600">Mã đơn hàng:</span>
              <span className="font-semibold text-slate-800">
                {codes.join(", ")}
              </span>
            </div>

            <div className="flex justify-between pt-3 bg-blue-50 p-4 rounded-lg">
              <span className="text-lg font-bold text-slate-800">
                Tổng thanh toán:
              </span>
              <span className="text-2xl font-bold text-primary">
                {totalAmount.toLocaleString("vi-VN")} đ
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            Phương thức thanh toán
          </h2>

          <div className="bg-blue-50 border-2 border-primary rounded-lg p-6 mb-6">
            <p className="text-lg font-semibold text-slate-800 mb-2">
              💳 Chuyển khoản ngân hàng qua PayOS
            </p>
            <p className="text-slate-600">
              Quét mã QR hoặc chuyển khoản thủ công. An toàn và nhanh chóng.
            </p>
          </div>

          {!paymentLink ? (
            <button
              onClick={handleCreatePaymentLink}
              disabled={isCreatingLink}
              className="w-full py-4 bg-primary text-white font-bold text-lg rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingLink ? "⏳ Đang tạo link..." : "✓ Tạo link thanh toán"}
            </button>
          ) : (
            <button
              onClick={handlePayment}
              className="w-full py-4 bg-green-600 text-white font-bold text-lg rounded-lg hover:bg-green-700 transition-colors duration-200 animate-pulse"
            >
              → Tiến hành thanh toán
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            📖 Hướng dẫn thanh toán
          </h2>

          <ol className="space-y-3 text-slate-600">
            <li className="flex gap-3">
              <span className="font-bold text-primary">1.</span>
              <span>Nhấn nút "Tạo link thanh toán" để khởi tạo</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">2.</span>
              <span>Sau khi tạo thành công, nhấn "Tiến hành thanh toán"</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">3.</span>
              <span>Quét mã QR hoặc nhập thông tin chuyển khoản</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">4.</span>
              <span>Sau khi thanh toán, bạn sẽ được chuyển hướng tự động</span>
            </li>
          </ol>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => router.back()}
              className="py-2 px-4 text-primary font-semibold hover:text-blue-700"
            >
              ← Quay lại
            </button>
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
