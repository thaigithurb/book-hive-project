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
    return <div className="text-center mt-20">Đang tải...</div>;
  }

  if (!user) {
    return (
      <div className="container mx-auto py-20 px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">👤</div>
          <h1 className="text-2xl font-bold mb-4">Bạn chưa đăng nhập</h1>
          <p className="text-gray-600 mb-6">
            Vui lòng đăng nhập để xem hồ sơ cá nhân và lịch sử mua hàng
          </p>
          <div className="flex gap-4">
            <Link
              href="/auth/login"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
            >
              Đăng nhập
            </Link>
            <Link
              href="/auth/register"
              className="flex-1 bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 transition"
            >
              Đăng ký
            </Link>
          </div>
        </div>
        <div className="min-h-[280px]"></div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Hồ sơ cá nhân</h1>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                <div className="text-6xl">👤</div>
                <div>
                  <h2 className="text-2xl font-bold">{user.fullName}</h2>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-600 text-sm">Họ và tên</label>
                    <p className="text-lg font-semibold">{user.fullName}</p>
                  </div>
                  <div>
                    <label className="text-gray-600 text-sm">Email</label>
                    <p className="text-lg font-semibold">{user.email}</p>
                  </div>
                </div>

                {user.phone && (
                  <div>
                    <label className="text-gray-600 text-sm">Điện thoại</label>
                    <p className="text-lg font-semibold">{user.phone}</p>
                  </div>
                )}

                {user.address && (
                  <div>
                    <label className="text-gray-600 text-sm">Địa chỉ</label>
                    <p className="text-lg font-semibold">{user.address}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t">
              <button
                onClick={() => router.push("/profile/edit")}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
              >
                Chỉnh sửa
              </button>
              <Logout
                url={`http://localhost:3001/api/v1/auth/logout`}
                href={"/home"}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition"
                side="client"
                icon={false}
              />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <Link
              href="/orders"
              className="block bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 text-center hover:shadow-lg transition"
            >
              <div className="text-2xl mb-2">📦</div>
              <h3 className="font-semibold">Đơn hàng</h3>
              <p className="text-sm text-gray-600">Xem lịch sử mua hàng</p>
            </Link>
            <Link
              href="/wishlist"
              className="block bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg p-4 text-center hover:shadow-lg transition"
            >
              <div className="text-2xl mb-2">❤️</div>
              <h3 className="font-semibold">Yêu thích</h3>
              <p className="text-sm text-gray-600">Sách yêu thích</p>
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
