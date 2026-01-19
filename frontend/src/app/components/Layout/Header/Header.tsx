"use client";

import { useCart } from "@/contexts/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ToastContainer } from "react-toastify";
import Logout from "../../Auth/Logout/Logout";

export const Header = () => {
  const router = useRouter();
  const { getTotalItems } = useCart();
  const [keyword, setKeyword] = useState("");
  const cartCount = getTotalItems();
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    const params = new URLSearchParams({
      keyWord: keyword,
      page: "1",
      limit: "12",
    });
    router.push(`/search?${params.toString()}`);
    setKeyword("");
  };

  return (
    <>
      <header className="p-[16px] fixed top-0 z-999 w-full bg-[#ffff] shadow-[0_2px_8px_rgba(0,0,0,0.05)] ">
        <nav className="container flex items-center justify-between">
          <Link href={"/home"} className="flex gap-[12px] items-center">
            <span className="text-[32px]">📚</span>
            <div>
              <h1
                className="m-0 text-[24px] font-[700] text-primary"
                title="BookHive"
              >
                BookHive
              </h1>
              <p className="text-[13.6px] text-[#64748b]">
                Nơi tri thức hội tụ
              </p>
            </div>
          </Link>
          <div className="flex gap-[24px] items-center">
            <form
              className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 transition-all duration-300 hover:bg-gray-200 focus-within:bg-white focus-within:shadow-[0_0_0_2px_rgba(59,130,246,0.2)]"
              onSubmit={handleSearch}
            >
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm kiếm sách..."
                className="bg-transparent outline-none text-sm text-primary placeholder-gray-400 transition-colors duration-300 flex-1"
              />
              <button
                type="submit"
                className="px-4 py-1 bg-primary text-white text-sm font-semibold rounded-full transition-all duration-300 hover:bg-blue-600 hover:shadow-[0_4px_12px_rgba(59,130,246,0.3)] active:scale-95 whitespace-nowrap"
              >
                Tìm
              </button>
            </form>
            <div className="relative group">
              <Link
                href="/books"
                className="text-primary font-medium transition-all duration-300 hover:text-blue-600 relative"
              >
                Tất cả sách
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>

              <div className="absolute left-0 mt-0 w-[160px] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top group-hover:translate-y-2 z-50">
                <Link
                  href="/books/rent-only"
                  className="block px-4 py-3 text-primary font-medium transition-all duration-300 hover:bg-blue-50 hover:text-blue-600 rounded-t-lg first:rounded-t-lg"
                >
                  📖 Sách thuê
                </Link>
                <div className="border-t border-gray-100"></div>
                <Link
                  href="/books/buy-only"
                  className="block px-4 py-3 text-primary font-medium transition-all duration-300 hover:bg-blue-50 hover:text-blue-600 rounded-b-lg last:rounded-b-lg"
                >
                  🛍️ Sách mua
                </Link>
              </div>
            </div>
            <Link
              href="/cart"
              className="relative px-4 py-2 text-primary font-medium transition-all duration-300 hover:bg-blue-50 hover:text-blue-600 rounded-lg hover:shadow-[0_4px_12px_rgba(59,130,246,0.2)]"
            >
              🛒 Giỏ hàng
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <div className="relative group">
              <Link
                href="/account"
                className="px-4 py-2 text-primary font-medium transition-all duration-300 hover:bg-blue-50 hover:text-blue-600 rounded-lg hover:shadow-[0_4px_12px_rgba(59,130,246,0.2)]"
              >
                👤 {user?.fullName ?? "Tài khoản"}
              </Link>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};
