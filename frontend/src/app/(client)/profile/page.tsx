"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Logout from "@/app/components/Auth/Logout/Logout";
import { ToastContainer } from "react-toastify";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userString = localStorage.getItem("client_user");
    if (userString) {
      setUser(JSON.parse(userString));
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="text-center mt-12 md:mt-20">Đang tải...</div>;
  }

  if (!user) {
    return (
      <div className="container mx-auto py-12 md:py-20 px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 md:p-8 text-center">
          <div className="text-5xl md:text-6xl mb-4">👤</div>
          <h1 className="text-xl md:text-2xl font-bold mb-4">
            Bạn chưa đăng nhập
          </h1>
          <p className="text-sm md:text-base text-gray-600 mb-6">
            Vui lòng đăng nhập để xem hồ sơ cá nhân và lịch sử mua hàng
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <Link
              href="/auth/login"
              className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition text-sm md:text-base"
            >
              Đăng nhập
            </Link>
            <Link
              href="/auth/register"
              className="flex-1 bg-gray-300 text-gray-800 py-2.5 px-4 rounded-lg hover:bg-gray-400 transition text-sm md:text-base"
            >
              Đăng ký
            </Link>
          </div>
        </div>
        <div className="min-h-[200px] md:min-h-[280px]"></div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto py-8 md:py-12 lg:py-24 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center md:text-left">
            Hồ sơ cá nhân
          </h1>

          <div className="bg-white rounded-lg shadow-lg p-4 md:p-8">
            <div className="mb-6 md:mb-8">
              <div className="flex flex-col md:flex-row items-center gap-4 mb-6 pb-6 border-b text-center md:text-left">
                <div className="text-5xl md:text-6xl">👤</div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">
                    {user.fullName}
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 break-all">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="text-gray-600 text-xs md:text-sm">
                      Họ và tên
                    </label>
                    <p className="text-base md:text-lg font-semibold">
                      {user.fullName}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-600 text-xs md:text-sm">
                      Email
                    </label>
                    <p className="text-base md:text-lg font-semibold break-all">
                      {user.email}
                    </p>
                  </div>
                </div>

                {user.phone && (
                  <div>
                    <label className="text-gray-600 text-xs md:text-sm">
                      Điện thoại
                    </label>
                    <p className="text-base md:text-lg font-semibold">
                      {user.phone}
                    </p>
                  </div>
                )}

                {user.address && (
                  <div>
                    <label className="text-gray-600 text-xs md:text-sm">
                      Địa chỉ
                    </label>
                    <p className="text-base md:text-lg font-semibold">
                      {user.address}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-6 border-t">
              <button
                onClick={() => router.push("/profile/edit")}
                className="flex-1 bg-blue-600 text-white cursor-pointer py-2.5 px-4 rounded-lg hover:bg-blue-700 transition text-sm md:text-base"
              >
                Chỉnh sửa
              </button>
              <Logout
                url={`${API_URL}/api/v1/auth/logout`}
                href={"/home"}
                className="flex-1 cursor-pointer bg-red-600 text-white py-2.5 px-4 rounded-lg hover:bg-red-700 transition text-center text-sm md:text-base"
                side="client"
                icon={false}
              />
            </div>
          </div>

          <div className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <Link
              href="/orders"
              className="block bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 text-center hover:shadow-lg transition"
            >
              <div className="text-2xl mb-2">📦</div>
              <h3 className="font-semibold text-base md:text-lg">Đơn hàng</h3>
              <p className="text-xs md:text-sm text-gray-600">
                Xem lịch sử mua hàng và thuê
              </p>
            </Link>
            <Link
              href="/favorites"
              className="block bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg p-4 text-center hover:shadow-lg transition"
            >
              <div className="text-2xl mb-2">❤️</div>
              <h3 className="font-semibold text-base md:text-lg">Yêu thích</h3>
              <p className="text-xs md:text-sm text-gray-600">Sách yêu thích</p>
            </Link>
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
