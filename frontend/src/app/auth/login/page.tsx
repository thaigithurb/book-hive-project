"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const handleLogin = async (data: LoginForm) => {
    setLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/api/v1/auth/loginWithPassword`,
        data,
        { withCredentials: true },
      );

      localStorage.setItem("accessToken_user", res.data.accessToken);
      localStorage.setItem("client_user", JSON.stringify(res.data.user));

      toast.success("Đăng nhập thành công!");
      setTimeout(() => {
        router.push("/home");
      }, 1600);
    } catch (err: any) {
      toast.error(err.response?.data?.message, {
        autoClose: 1600,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true);
      const token = credentialResponse.credential;

      const res = await axios.post(
        `${API_URL}/api/v1/auth/loginWithGoogle`,
        { token },
        { withCredentials: true },
      );

      localStorage.setItem("accessToken_user", res.data.accessToken);
      localStorage.setItem("client_user", JSON.stringify(res.data.user));

      toast.success("Đăng nhập với Google thành công!");
      setTimeout(() => {
        router.push("/home");
      }, 1600);
    } catch (err: any) {
      toast.error(err.response?.data?.message, {
        autoClose: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("Đăng nhập Google thất bại", {
      autoClose: 2000,
    });
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
                Đăng nhập tài khoản
              </p>
            </div>

            <form
              onSubmit={handleSubmit(handleLogin)}
              className="px-4 py-6 md:px-6 md:py-8 space-y-4 md:space-y-6"
            >
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-1.5 md:mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="Nhập email của bạn"
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
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-1.5 md:mb-2"
                >
                  Mật Khẩu
                </label>
                <div className="relative">
                  <input
                    id="password"
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

              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Ghi nhớ tôi</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition duration-200 flex items-center justify-center gap-2 text-sm md:text-base"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    <span>🔐</span>
                    Đăng Nhập
                  </>
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Hoặc</span>
                </div>
              </div>

              <div className="flex justify-center w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  width="100%"
                />
              </div>
            </form>

            <div className="px-4 py-4 md:px-6 bg-gray-50 border-t border-gray-200 text-center">
              <p className="text-gray-600 text-sm">
                Chưa có tài khoản?{" "}
                <Link
                  href="/auth/register"
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-6 text-center text-gray-600 text-xs px-2">
            <p>
              Bằng cách đăng nhập, bạn đã đồng ý với{" "}
              <Link href="/terms" className="text-blue-600 hover:underline">
                Điều khoản dịch vụ
              </Link>{" "}
              và{" "}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Chính sách bảo mật
              </Link>
            </p>
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
