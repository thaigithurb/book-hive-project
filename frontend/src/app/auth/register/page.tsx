"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const registerSchema = z
  .object({
    fullName: z.string().min(1, "Vui lòng nhập họ tên"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    confirmPassword: z.string().min(6, "Xác nhận mật khẩu tối thiểu 6 ký tự"),
    accept: z.literal(true, {
      message: "Bạn phải đồng ý với điều khoản",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const handleRegister = async (data: RegisterForm) => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/v1/auth/register`, {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      setTimeout(() => {
        router.push("/auth/login");
      }, 1600);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12 relative">
        <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-50 text-blue-600 font-semibold transition text-sm md:text-base"
          >
            <span>🏠</span>
            <span className="hidden sm:inline">Về trang chủ</span>
            <span className="sm:hidden">Trang chủ</span>
          </Link>
        </div>
        <div className="w-full max-w-md relative z-0">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-6 md:px-6 md:py-8 text-center">
              <div className="flex items-center justify-center gap-3 md:gap-5 mb-2">
                <Image
                  src="/book-hive.jpg"
                  className="w-12 h-12 md:w-16 md:h-16 rounded-[10px] object-cover"
                  alt="logo"
                  width={400}
                  height={400}
                />
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  BookHive
                </h1>
              </div>
              <p className="text-blue-100 text-sm md:text-base">
                Tạo tài khoản mới
              </p>
            </div>

            <form
              onSubmit={handleSubmit(handleRegister)}
              className="px-4 py-6 md:px-6 md:py-8 space-y-4 md:space-y-5"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                  Họ và Tên
                </label>
                <input
                  type="text"
                  {...register("fullName")}
                  placeholder="Nhập họ tên"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm md:text-base"
                  disabled={loading}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                  Email
                </label>
                <input
                  type="email"
                  {...register("email")}
                  placeholder="Nhập email"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm md:text-base"
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                  Mật Khẩu
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="Nhập mật khẩu"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm md:text-base"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                  Xác Nhận Mật Khẩu
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm md:text-base"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <label className="flex items-center gap-2 md:gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("accept")}
                  className="w-4 h-4 rounded border-gray-300 mt-1 focus:ring-2 focus:ring-blue-500 shrink-0"
                  disabled={loading}
                />
                <span className="text-xs md:text-sm text-gray-600">
                  Tôi đồng ý với{" "}
                  <Link href="/terms" className="text-blue-600 hover:underline">
                    Điều khoản dịch vụ
                  </Link>{" "}
                  và{" "}
                  <Link
                    href="/privacy"
                    className="text-blue-600 hover:underline"
                  >
                    Chính sách bảo mật
                  </Link>
                </span>
              </label>
              {errors.accept && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.accept.message}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm md:text-base transition duration-200"
              >
                {loading ? "Đang đăng ký..." : "Đăng Ký"}
              </button>
            </form>

            <div className="px-4 py-4 md:px-6 bg-gray-50 border-t border-gray-200 text-center">
              <p className="text-gray-600 text-sm">
                Đã có tài khoản?{" "}
                <Link
                  href="/auth/login"
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Đăng nhập
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer
        autoClose={1500}
        hideProgressBar={true}
        pauseOnHover={false}
      />
    </>
  );
}
