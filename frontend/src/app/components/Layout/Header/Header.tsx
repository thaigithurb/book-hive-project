"use client";

import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export const Header = () => {
  const router = useRouter();
  const { getTotalItems } = useCart();
  const [keyword, setKeyword] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartCount = getTotalItems();
  const userString =
    typeof window !== "undefined" ? localStorage.getItem("client_user") : null;
  const user = userString ? JSON.parse(userString) : null;

  const handleSearch = (e: any) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    const params = new URLSearchParams({
      keyWord: keyword,
      page: "1",
      limit: "12",
    });
    router.push(`/search?${params.toString()}`);
    setKeyword("");
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="p-3 md:p-[16px] fixed top-0 z-[999] w-full bg-[#ffff] shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
        <nav className="container mx-auto flex flex-wrap items-center justify-between">
          <div className="flex items-center justify-between w-full lg:w-auto">
            <Link
              href={"/home"}
              className="flex gap-2 md:gap-[12px] items-center"
            >
              <span className="text-[24px] md:text-[32px]">
                <Image
                  width={400}
                  height={400}
                  src="/book-hive.jpg"
                  className="w-10 h-10 md:w-20 md:h-20 object-contain"
                  alt="logo"
                />
              </span>
              <div>
                <h1
                  className="m-0 text-[18px] md:text-[24px] font-[700] text-primary leading-tight"
                  title="BookHive"
                >
                  BookHive
                </h1>
                <p className="text-[10px] md:text-[13.6px] text-[#64748b]">
                  Nơi tri thức hội tụ
                </p>
              </div>
            </Link>

            <button
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg
                className="w-5 h-5 md:w-6 md:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          <div
            className={`${
              isMobileMenuOpen ? "flex" : "hidden"
            } lg:flex flex-col lg:flex-row w-full lg:w-auto gap-3 lg:gap-[24px] items-stretch lg:items-center mt-3 lg:mt-0 transition-all duration-300`}
          >
            <form
              className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5 md:px-4 md:py-2 transition-all duration-300 hover:bg-gray-200 focus-within:bg-white focus-within:shadow-[0_0_0_2px_rgba(59,130,246,0.2)] w-full lg:w-auto"
              onSubmit={handleSearch}
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5 text-gray-400 shrink-0"
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
                className="bg-transparent outline-none text-xs md:text-sm text-primary placeholder-gray-400 transition-colors duration-300 flex-1 min-w-[150px]"
              />
              <button
                type="submit"
                className="px-3 md:px-4 cursor-pointer py-1 bg-primary text-white text-xs md:text-sm font-semibold rounded-full transition-all duration-300 hover:bg-blue-600 hover:shadow-[0_4px_12px_rgba(59,130,246,0.3)] active:scale-95 whitespace-nowrap"
              >
                Tìm
              </button>
            </form>

            <div className="flex flex-col lg:flex-row gap-3 lg:gap-[24px] items-start lg:items-center text-sm md:text-base">
              <div className="relative group w-full lg:w-auto">
                <Link
                  href="/books"
                  className="text-primary font-medium transition-all duration-300 hover:text-blue-600 relative block py-2 lg:py-0"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Tất cả sách
                  <span className="hidden lg:block absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>

                <div className="lg:absolute lg:left-0 lg:mt-0 w-full lg:w-[160px] bg-white lg:shadow-[0_8px_24px_rgba(0,0,0,0.12)] rounded-lg lg:opacity-0 lg:invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top lg:group-hover:translate-y-2 z-50 border border-gray-100 lg:border-none text-sm md:text-base">
                  <Link
                    href="/books/rent-only"
                    className="block px-4 py-2 md:py-3 text-primary font-medium transition-all duration-300 hover:bg-blue-50 hover:text-blue-600 lg:rounded-t-lg first:rounded-t-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    📖 Sách thuê
                  </Link>
                  <div className="border-t border-gray-100"></div>
                  <Link
                    href="/books/buy-only"
                    className="block px-4 py-2 md:py-3 text-primary font-medium transition-all duration-300 hover:bg-blue-50 hover:text-blue-600 lg:rounded-b-lg last:rounded-b-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    🛍️ Sách mua
                  </Link>
                </div>
              </div>

              <Link
                href="/look-up"
                className="px-4 py-2 text-primary font-medium transition-all duration-300 hover:bg-blue-50 hover:text-blue-600 rounded-lg hover:shadow-[0_4px_12px_rgba(59,130,246,0.2)] whitespace-nowrap w-full lg:w-auto"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                📋 Tra cứu
              </Link>

              <Link
                href="/cart"
                className="relative px-4 py-2 text-primary font-medium transition-all duration-300 hover:bg-blue-50 hover:text-blue-600 rounded-lg hover:shadow-[0_4px_12px_rgba(59,130,246,0.2)] w-full lg:w-auto flex items-center gap-2 lg:block"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="lg:hidden">🛒 Giỏ hàng</span>
                <span className="hidden lg:inline">🛒 Giỏ hàng</span>
                {cartCount > 0 && (
                  <span className="lg:absolute relative lg:top-1 lg:right-1 ml-auto lg:ml-0 bg-red-500 text-white text-[10px] md:text-xs font-bold rounded-full w-4 h-4 md:w-5 md:h-5 lg:w-4 lg:h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              <div className="relative group w-full lg:w-auto">
                <Link
                  href="/profile"
                  className="px-4 py-2 text-primary font-medium transition-all duration-300 hover:bg-blue-50 hover:text-blue-600 rounded-lg hover:shadow-[0_4px_12px_rgba(59,130,246,0.2)] block w-full lg:w-auto"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  👤 {user?.fullName ?? "Tài khoản"}
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};
