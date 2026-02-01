"use client";

import { BackButton } from "@/app/components/Button/BackButton/BackButton";
import { ToastContainer, toast } from "react-toastify";
import DOMPurify from "dompurify";
import { useCart } from "@/contexts/CartContext";
import { FaStar } from "react-icons/fa";
import { useState } from "react";
import { Book } from "@/app/interfaces/book.interface";
import Image from "next/image";

type DetailClientProps = {
  book: Book;
};

export default function DetailClient({ book }: DetailClientProps) {
  const [rentType, setRentType] = useState<"day" | "week">("day");
  const [rentQuantity, setRentQuantity] = useState<number | string>(1);
  const { addToCart, addToRent } = useCart();

  const getRentPrice = () => {
    if (!book?.priceRentOptions) return null;
    const option = book.priceRentOptions.find(
      (opt: any) => opt.type === rentType,
    );
    if (!option) return null;
    return option.price * Number(rentQuantity);
  };

  const handleBuyNow = () => {
    if (!book) return;
    addToCart({
      bookId: book._id,
      title: book.title,
      price: book.priceBuy,
      quantity: 1,
      image: book.image,
      slug: book.slug,
      type: "buy",
    } as any);
    toast.success("Đã thêm vào giỏ hàng!");
  };

  const handleRentNow = () => {
    if (!book) return;
    const rentOption = book.priceRentOptions.find(
      (opt: any) => opt.type === rentType,
    );
    if (!rentOption) {
      toast.error("Loại thuê không hợp lệ!");
      return;
    }
    addToRent({
      bookId: book._id,
      title: book.title,
      price: rentOption.price,
      quantity: 1,
      image: book.image,
      slug: book.slug,
      type: "rent",
      rentalType: rentType,
      rentalDays: Number(rentQuantity),
    } as any);
    toast.success("Đã thêm vào giỏ hàng!");
  };

  return (
    <>
      <div className="py-6 md:py-12 relative px-4 md:px-0">
        <BackButton className="absolute top-0 left-4 md:-top-4 md:left-20 flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition cursor-pointer z-10" />

        <div className="max-w-4xl mx-auto mt-12 md:mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 mb-8 md:mb-12">
            <div className="bg-white rounded-2xl p-6 md:p-10 text-center shadow flex flex-col items-center justify-center">
              {book.image ? (
                <Image
                  src={book.image}
                  alt={book.title}
                  width={400}
                  height={400}
                  className="w-full h-auto max-h-[400px] object-contain rounded-lg mb-6"
                />
              ) : (
                <div className="text-8xl md:text-[128px] mb-6">📚</div>
              )}
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-yellow-400 text-xl md:text-2xl">
                  <FaStar />
                </span>
                <span className="text-lg md:text-xl font-bold text-slate-800">
                  {book.rating ?? "Liên hệ"}
                </span>
                <span className="text-sm md:text-base text-slate-400">
                  ({book.reviews ?? 0} đánh giá)
                </span>
              </div>
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-3 text-slate-800">
                {book.title}
              </h1>
              <p className="text-base md:text-[17.6px] text-slate-400 mb-2">
                Tác giả: {book.author}
              </p>
              <p className="text-sm md:text-base text-slate-400 mb-6">
                Thể loại: {book.category_name}
              </p>
              <p
                className="text-sm md:text-base text-slate-800 mb-8 leading-relaxed"
                style={{ maxHeight: 120, overflowY: "auto" }}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(book.description),
                }}
              ></p>
              <div className="bg-white rounded-xl p-4 md:p-6 mb-6 shadow">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm md:text-base text-slate-800">
                    Giá mua:
                  </span>
                  <span className="text-xl md:text-2xl font-bold text-secondary1">
                    {book.priceBuy
                      ? `${book.priceBuy.toLocaleString("vi-VN")}đ`
                      : "Liên hệ"}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm md:text-base text-slate-800">
                    Giá thuê:
                  </span>
                  <span className="text-xl md:text-2xl font-bold text-secondary1">
                    {getRentPrice() !== null && getRentPrice() !== undefined
                      ? `${getRentPrice()!.toLocaleString("vi-VN")}đ`
                      : "Liên hệ"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <select
                    className="border rounded-lg px-2 py-1 text-sm md:text-base"
                    value={rentType}
                    onChange={(e) =>
                      setRentType(e.target.value as "day" | "week")
                    }
                  >
                    <option value="day">Ngày</option>
                    <option value="week">Tuần</option>
                  </select>
                  <input
                    type="number"
                    min={1}
                    max={rentType === "day" ? 6 : 4}
                    className="border rounded-lg px-2 py-1 w-16 md:w-20 text-sm md:text-base"
                    value={rentQuantity}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        setRentQuantity("");
                      } else {
                        const num = Number(val);
                        const max = rentType === "day" ? 6 : 4;
                        if (num < 1) setRentQuantity(1);
                        else if (num > max) setRentQuantity(max);
                        else setRentQuantity(num);
                      }
                    }}
                  />
                  <span className="text-sm md:text-base text-slate-600">
                    {rentType === "day"
                      ? "ngày"
                      : rentType === "week"
                        ? "tuần"
                        : ""}
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <button
                  onClick={handleBuyNow}
                  className="flex-1 py-3 md:py-4 font-semibold cursor-pointer bg-secondary1 text-white rounded-xl text-sm md:text-base hover:bg-blue-700 transition-colors duration-200"
                >
                  🛒 Mua ngay
                </button>
                <button
                  onClick={handleRentNow}
                  className="flex-1 py-3 md:py-4 font-semibold bg-white text-secondary1 border-2 border-secondary1 rounded-xl cursor-pointer text-sm md:text-base hover:bg-blue-50 transition-colors duration-200"
                >
                  📖 Thuê sách
                </button>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 md:p-8 shadow">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-slate-800">
              Đánh giá &amp; Nhận xét
            </h2>
            <div className="bg-blue-50 rounded-xl p-4 md:p-6 mb-6 md:mb-8">
              <h3 className="text-base md:text-[17.6px] font-semibold mb-4 text-slate-800">
                Viết đánh giá của bạn
              </h3>
              <div className="mb-4">
                <label className="block mb-2 text-sm md:text-[14.4px] text-slate-800">
                  Đánh giá:
                </label>
                <div className="text-2xl flex gap-[4px] text-[#d1d5db]">
                  <span className="cursor-pointer">★</span>
                  <span className="cursor-pointer">★</span>
                  <span className="cursor-pointer">★</span>
                  <span className="cursor-pointer">★</span>
                  <span className="cursor-pointer">★</span>
                </div>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="reviewText"
                  className="block mb-2 text-sm md:text-[14.4px] text-slate-800"
                >
                  Nhận xét:
                </label>
                <textarea
                  id="reviewText"
                  rows={4}
                  placeholder="Chia sẻ cảm nhận của bạn về cuốn sách..."
                  className="w-full hover:border-secondary1 p-3 border-2 border-slate-200 rounded-lg text-sm md:text-base bg-white text-slate-800 resize-vertical outline-none focus:ring-2 focus:ring-secondary1 focus:border-secondary1 transition duration-200"
                />
              </div>
              <button className="px-6 py-3 bg-secondary1 text-white rounded-lg font-semibold text-sm md:text-base hover:bg-blue-700 cursor-pointer transition-colors duration-200">
                Gửi đánh giá
              </button>
            </div>
            <div>
              <p className="text-center text-slate-400 text-sm md:text-base">
                Chưa có đánh giá nào. Hãy là người đầu tiên!
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
