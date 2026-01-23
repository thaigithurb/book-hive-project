"use client";

import { BackButton } from "@/app/components/Button/BackButton/BackButton";
import { Loading } from "@/app/components/Loading/Loading";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import DOMPurify from "dompurify";
import { useCart } from "@/contexts/CartContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Detail() {
  const params = useParams();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rentType, setRentType] = useState("day");
  const [rentQuantity, setRentQuantity] = useState<number | string>(1);
  const { addToCart, addToRent } = useCart(); // ADDED addToRent

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${API_URL}/api/v1/books/detail/${params.slug}`,
        );
        setBook(res.data.book);
      } catch (err) {
        toast.error("Không tìm thấy sách!");
        setBook(null);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [params.slug]);

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
      type: "buy", // ADDED
    } as any);

    toast.success("Đã thêm vào giỏ hàng!");
  };

  // ADDED: Hàm mượn sách
  const handleRentNow = () => {
    if (!book) return;

    const rentOption = book.priceRentOptions.find(
      (opt: any) => opt.type === rentType,
    );

    if (!rentOption) {
      toast.error("❌ Loại thuê không hợp lệ!");
      return;
    }

    addToRent({
      bookId: book._id,
      title: book.title,
      price: rentOption.price,
      quantity: 1,
      image: book.image,
      slug: book.slug,
      type: "rent", // ADDED
      rentalType: rentType as "day" | "week", // ADDED
      rentalDays: Number(rentQuantity), // ADDED
    } as any);

    toast.success("Đã thêm vào giỏ thuê!");
  };

  if (loading) {
    return (
      <Loading fullScreen={true} size="lg" text="Đang tải thông tin sách..." />
    );
  }

  if (!book) {
    return (
      <div className="bg-blue-50 min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500 font-semibold">
          Không tìm thấy sách!
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen py-12 relative">
        <BackButton className="absolute -top-4 left-20 flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition cursor-pointer" />
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div className="bg-white rounded-2xl p-10 text-center shadow flex flex-col items-center justify-center">
              {book.image ? (
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-full h-full max-h-[400px] object-cover rounded-lg mb-6"
                />
              ) : (
                <div className="text-[128px] mb-6">📚</div>
              )}
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-yellow-400 text-2xl">⭐</span>
                <span className="text-xl font-bold text-slate-800">
                  {book.rating ?? "Liên hệ"}
                </span>
                <span className="text-base text-slate-400">
                  ({book.reviews ?? 0} đánh giá)
                </span>
              </div>
            </div>
            <div className="">
              <h1 className="text-3xl font-bold mb-3 text-slate-800">
                {book.title}
              </h1>
              <p className="text-[17.6px] text-slate-400 mb-2">
                Tác giả: {book.author}
              </p>
              <p className="text-base text-slate-400 mb-6">
                Thể loại: {book.category_name}
              </p>
              <p
                className="text-base text-slate-800 mb-8 leading-relaxed"
                style={{ maxHeight: 120, overflowY: "auto" }}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(book.description),
                }}
              ></p>
              <div className="bg-white rounded-xl p-6 mb-6 shadow">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-base text-slate-800">Giá mua:</span>
                  <span className="text-2xl font-bold text-secondary1">
                    {book.priceBuy
                      ? `${book.priceBuy.toLocaleString("vi-VN")}đ`
                      : "Liên hệ"}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-base text-slate-800">Giá thuê:</span>
                  <span className="text-2xl font-bold text-secondary1">
                    {getRentPrice() !== null && getRentPrice() !== undefined
                      ? `${getRentPrice()!.toLocaleString("vi-VN")}đ`
                      : "Liên hệ"}
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  <select
                    className="border rounded-lg px-2 py-1 text-base"
                    value={rentType}
                    onChange={(e) => setRentType(e.target.value)}
                  >
                    <option value="day">Ngày</option>
                    <option value="week">Tuần</option>
                  </select>
                  <input
                    type="number"
                    min={1}
                    max={rentType === "day" ? 6 : 4}
                    className="border rounded-lg px-2 py-1 w-20 text-base"
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
                  <span className="text-base text-slate-600">
                    {rentType === "day"
                      ? "ngày"
                      : rentType === "week"
                        ? "tuần"
                        : ""}
                  </span>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleBuyNow}
                  className="flex-1 py-4 font-semibold cursor-pointer bg-secondary1 text-white rounded-xl text-base hover:bg-blue-700 transition-colors duration-200"
                >
                  🛒 Mua ngay
                </button>
                <button
                  onClick={handleRentNow}
                  className="flex-1 py-4 font-semibold bg-white text-secondary1 border-2 border-secondary1 rounded-xl cursor-pointer text-base hover:bg-blue-50 transition-colors duration-200"
                >
                  📖 Mượn sách
                </button>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">
              Đánh giá &amp; Nhận xét
            </h2>
            <div className="bg-blue-50 rounded-xl p-6 mb-8">
              <h3 className="text-[17.6px] font-semibold mb-4 text-slate-800">
                Viết đánh giá của bạn
              </h3>
              <div className="mb-4">
                <label className="block mb-2 text-[14.4px] text-slate-800">
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
                  className="block mb-2 text-[14.4px] text-slate-800"
                >
                  Nhận xét:
                </label>
                <textarea
                  id="reviewText"
                  rows={4}
                  placeholder="Chia sẻ cảm nhận của bạn về cuốn sách..."
                  className="w-full hover:border-secondary1 p-3 border-2 border-slate-200 rounded-lg text-base bg-white text-slate-800 resize-vertical outline-none focus:ring-2 focus:ring-secondary1 focus:border-secondary1 transition duration-200"
                />
              </div>
              <button className="px-6 py-3 bg-secondary1 text-white rounded-lg font-semibold text-base hover:bg-blue-700 cursor-pointer transition-colors duration-200">
                Gửi đánh giá
              </button>
            </div>
            <div>
              <p className="text-center text-slate-400 text-base">
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
