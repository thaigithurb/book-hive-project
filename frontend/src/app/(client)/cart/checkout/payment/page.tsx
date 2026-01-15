"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useCart } from "@/contexts/CartContext";
import { Loading } from "@/app/components/Loading/Loading";
import axios from "axios";

interface PaymentInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const [isLoaded, setIsLoaded] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [orderCode, setOrderCode] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"transfer" | "cod">(
    "transfer"
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyAttempts, setVerifyAttempts] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300);

  useEffect(() => {
    setIsLoaded(true);

    const savedOrderCode = sessionStorage.getItem("orderCode");
    const savedPaymentMethod = sessionStorage.getItem("paymentMethod") as
      | "transfer"
      | "cod";
    const savedTimestamp = sessionStorage.getItem("paymentTimestamp");

    if (!savedOrderCode) {
      toast.error("Không tìm thấy đơn hàng!");
      router.push("/cart");
      return;
    }

    setOrderCode(savedOrderCode);
    if (savedPaymentMethod) setPaymentMethod(savedPaymentMethod);

    // ✅ FIX: Xử lý timestamp an toàn
    if (savedTimestamp) {
      const elapsedTime = Math.floor(
        (Date.now() - parseInt(savedTimestamp)) / 1000
      );
      const remaining = Math.max(0, 300 - elapsedTime);

      // Nếu còn thời gian, khôi phục; nếu hết, reset
      if (remaining > 0) {
        setTimeRemaining(remaining);
      } else {
        // Hết giờ từ lần trước, reset timestamp
        sessionStorage.setItem("paymentTimestamp", Date.now().toString());
        setTimeRemaining(300);
      }
    } else {
      // Lần đầu, tạo timestamp mới
      sessionStorage.setItem("paymentTimestamp", Date.now().toString());
      setTimeRemaining(300);
    }

    fetchPaymentInfo(savedOrderCode);
  }, [router]);

  // ✅ Timer countdown - KHÔNG auto-verify
  useEffect(() => {
    if (paymentMethod !== "transfer") return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;

        // Hết giờ - quay về giỏ hàng
        if (newTime <= 0) {
          console.log("⏰ Hết thời gian thanh toán");
          sessionStorage.removeItem("paymentTimestamp");
          sessionStorage.removeItem("orderCode");
          sessionStorage.removeItem("paymentMethod");

          toast.warning("⏰ Hết thời gian thanh toán. Quay về giỏ hàng.");

          setTimeout(() => {
            router.push("/cart");
          }, 2000);

          return 0;
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentMethod, router]);

  const fetchPaymentInfo = async (code: string) => {
    try {
      const response = await axios.get(
        "http://localhost:3001/api/v1/payments/info"
      );
      const paymentData = response.data.data;
      setPaymentInfo(paymentData);
      generateQRCode(code, paymentData);
    } catch (err) {
      console.error("Lỗi lấy thông tin thanh toán:", err);
      toast.error("Lỗi lấy thông tin thanh toán!");
    }
  };

  const generateQRCode = (code: string, info: PaymentInfo) => {
    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const qrUrl = `https://api.vietqr.io/image/970422-${
      info.accountNumber
    }-DozjS6M.jpg?amount=${totalAmount}&addInfo=BookHive${code}&accountName=${encodeURIComponent(
      info.accountHolder
    )}`;

    setQrCode(qrUrl);
  };

  // ✅ CHỈ verify khi user bấm nút
  const handleVerifyPayment = async () => {
    if (!orderCode) {
      toast.error("Không tìm thấy mã đơn hàng!");
      return;
    }

    setIsVerifying(true);
    setVerifyAttempts((prev) => prev + 1);

    try {
      const response = await axios.post(
        "http://localhost:3001/api/v1/payments/verify",
        { orderCode }
      );

      if (response.status === 200 && response.data.order?.status === "paid") {
        toast.success("✅ Xác nhận thanh toán thành công!");
        clearCart();

        sessionStorage.removeItem("orderCode");
        sessionStorage.removeItem("paymentMethod");
        sessionStorage.removeItem("paymentTimestamp");

        setTimeout(() => {
          router.push(`/order-success?orderCode=${orderCode}`);
        }, 1500);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Lỗi xác nhận thanh toán!";
      toast.error(message);
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCODConfirm = () => {
    clearCart();
    sessionStorage.removeItem("orderCode");
    sessionStorage.removeItem("paymentMethod");
    sessionStorage.removeItem("paymentTimestamp");
    router.push(`/order-success?orderCode=${orderCode}`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!isLoaded) {
    return <Loading fullScreen={true} size="lg" text="Đang tải..." />;
  }

  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">✓</div>
                <h1 className="text-3xl font-bold text-green-600 mb-2">
                  Đơn hàng đã được tạo!
                </h1>
                <p className="text-slate-600">
                  Mã đơn hàng: <span className="font-bold">{orderCode}</span>
                </p>
              </div>
            </div>

            {paymentMethod === "transfer" && paymentInfo && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">
                  📱 Thông tin chuyển khoản
                </h2>

                <div
                  className={`mb-6 p-4 rounded-lg text-center font-semibold ${
                    timeRemaining > 60
                      ? "bg-blue-50 text-blue-800"
                      : timeRemaining > 0
                      ? "bg-red-50 text-red-800"
                      : "bg-gray-50 text-gray-800"
                  }`}
                >
                  <p className="text-sm">Thời gian chuyển khoản:</p>
                  <p className="text-3xl font-bold">
                    {timeRemaining > 0 ? formatTime(timeRemaining) : "Hết giờ"}
                  </p>
                  {timeRemaining <= 0 && (
                    <p className="text-sm mt-2">⏳ Quay về giỏ hàng...</p>
                  )}
                </div>

                <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                  <p className="text-sm text-blue-800 font-semibold">
                    📝 Hướng dẫn:
                  </p>
                  <p className="text-xs text-blue-700 mt-2">
                    1. Quét mã QR hoặc nhập thông tin chuyển khoản bên dưới
                  </p>
                  <p className="text-xs text-blue-700">
                    2. Chuyển đúng số tiền và nội dung
                  </p>
                  <p className="text-xs text-blue-700">
                    3. Sau khi chuyển, bấm nút "✅ Tôi đã chuyển khoản" để xác
                    nhận
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="flex flex-col items-center">
                    {qrCode && (
                      <img
                        src={qrCode}
                        alt="QR Code"
                        className={`w-64 h-64 border-4 border-blue-500 rounded-lg shadow-lg ${
                          timeRemaining <= 0 ? "opacity-50" : ""
                        }`}
                      />
                    )}
                    <p className="text-sm text-slate-500 mt-4 text-center">
                      Quét mã QR bằng ứng dụng ngân hàng
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <p className="text-sm text-slate-600 font-semibold">
                        Ngân hàng
                      </p>
                      <p className="text-xl font-bold text-slate-800">
                        {paymentInfo.bankName}
                      </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <p className="text-sm text-slate-600 font-semibold">
                        Chủ tài khoản
                      </p>
                      <p className="text-lg font-bold text-slate-800">
                        {paymentInfo.accountHolder}
                      </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <p className="text-sm text-slate-600 font-semibold">
                        Số tài khoản
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-bold text-slate-800 font-mono">
                          {paymentInfo.accountNumber}
                        </p>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              paymentInfo.accountNumber
                            );
                            toast.success("Đã sao chép!");
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800"
                          disabled={timeRemaining <= 0}
                        >
                          📋
                        </button>
                      </div>
                    </div>

                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
                      <p className="text-sm text-orange-800 font-semibold mb-2">
                        💰 Số tiền cần chuyển:
                      </p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(totalAmount)}
                      </p>
                    </div>

                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                      <p className="text-sm text-yellow-800 font-semibold">
                        📝 Nội dung chuyển:
                      </p>
                      <p className="text-sm font-mono text-yellow-900 break-all">
                        BookHive{orderCode}
                      </p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`BookHive${orderCode}`);
                          toast.success("Đã sao chép nội dung!");
                        }}
                        className="text-xs text-yellow-700 hover:text-yellow-900 mt-2"
                        disabled={timeRemaining <= 0}
                      >
                        📋 Sao chép
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleVerifyPayment}
                  disabled={isVerifying || timeRemaining <= 0}
                  className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {timeRemaining <= 0
                    ? "❌ Hết thời gian thanh toán"
                    : isVerifying
                    ? `⏳ Đang kiểm tra... (lần ${verifyAttempts})`
                    : "✅ Tôi đã chuyển khoản"}
                </button>

                <p className="text-sm text-slate-600 text-center mt-4 p-3 bg-blue-50 rounded">
                  ⏱️ Vui lòng chuyển đúng nội dung và số tiền. Bấm nút xác nhận
                  khi đã chuyển xong.
                </p>
              </div>
            )}

            {paymentMethod === "cod" && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">
                  🚚 Thanh toán khi nhận hàng
                </h2>
                <div className="bg-blue-50 p-6 rounded-lg text-center border-2 border-blue-200">
                  <p className="text-lg text-slate-800 mb-4">
                    Bạn sẽ thanh toán tiền mặt khi nhận hàng
                  </p>
                  <p className="text-sm text-slate-600 mb-6">
                    Số tiền:{" "}
                    <span className="font-bold text-lg text-blue-600">
                      {formatCurrency(totalAmount)}
                    </span>
                  </p>
                  <button
                    onClick={handleCODConfirm}
                    className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                  >
                    ✓ Xác nhận
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-40">
              <h3 className="text-xl font-bold text-slate-800 mb-6">
                📦 Tóm tắt đơn hàng
              </h3>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-slate-600 flex-1">{item.title}</span>
                    <span className="text-slate-600 mx-2">
                      x{item.quantity}
                    </span>
                    <span className="font-semibold text-slate-800 text-right min-w-[100px]">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between mb-6 p-3 bg-blue-50 rounded">
                <span className="font-bold text-slate-800">Tổng:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatCurrency(totalAmount)}
                </span>
              </div>

              <Link
                href="/cart/checkout"
                className="block w-full py-3 bg-gray-100 text-slate-800 font-bold rounded-lg hover:bg-gray-200 transition-colors text-center"
              >
                ← Quay lại
              </Link>
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
