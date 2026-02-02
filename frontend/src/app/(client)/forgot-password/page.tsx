"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { useRouter } from "next/navigation";
import { BackButton } from "@/app/components/Button/BackButton/BackButton";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const forgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ").min(1, "Vui lòng nhập email"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    if (shouldRedirect) {
      const timer = setTimeout(() => {
        router.push("/forgot-password/verify-otp");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [shouldRedirect, router]);

  const handleSendOtp = async (formData: ForgotPasswordForm) => {
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/v1/auth/forgot-password/send-otp`,
        {
          email: formData.email,
        },
      );

      if (response.data.success) {
        localStorage.setItem("forgotPasswordEmail", formData.email);
        localStorage.setItem("otpExpiresAt", response.data.expiresAt);

        toast.success("OTP đã được gửi tới email của bạn");
        setShouldRedirect(true);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Gửi OTP thất bại!";
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 md:py-12 px-4">
      <div className="container mx-auto max-w-md">
        <div className="mb-6">
          <BackButton className="flex cursor-pointer items-center gap-2 hover:opacity-80 transition-opacity" />
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
              Quên Mật Khẩu?
            </h1>
            <p className="text-sm md:text-base text-slate-600">
              Nhập email của bạn và chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu
            </p>
          </div>

          <form onSubmit={handleSubmit(handleSendOtp)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Địa chỉ Email
              </label>
              <input
                type="email"
                {...register("email")}
                placeholder="example@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm md:text-base"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-red-500 text-xs md:text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full cursor-pointer py-3 bg-primary text-white font-bold rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-sm md:text-base"
            >
              {isLoading ? "Đang gửi..." : "📧 Gửi Mã OTP"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs md:text-sm text-slate-500 text-center">
              Bạn chưa nhận được email?
            </p>
            <p className="text-xs md:text-sm text-slate-500 text-center mt-1">
              Kiểm tra thư mục spam hoặc liên hệ
              <a
                href="mailto:bookhivestore161@gmail.com"
                target="_blank"
                className="text-primary font-semibold hover:underline ml-1"
              >
                bookhivestore161@gmail.com
              </a>
            </p>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs md:text-sm text-blue-800">
              <strong>💡 Mẹo:</strong> Mã OTP sẽ hết hạn sau 5 phút. Vui lòng
              kiểm tra email ngay.
            </p>
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
