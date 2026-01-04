"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { BackButton } from "@/app/components/BackButton/BackButton";
import { motion, AnimatePresence } from "framer-motion"; 
import DOMPurify from "dompurify";

const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX;

export default function BookDetail() {
  const { slug } = useParams();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3001/api/v1/${ADMIN_PREFIX}/books/detail/${slug}`
        );
        setBook(res.data.book);
      } catch (err) {
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [slug]);

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen flex items-center justify-center"
        >
          <div className="text-xl text-gray-500">Đang tải...</div>
        </motion.div>
      ) : !book ? (
        <motion.div
          key="not-found"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="min-h-screen flex items-center justify-center bg-blue-50 relative"
        >
          <BackButton className="absolute top-2 left-8 flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition cursor-pointer" />
          <div className="text-xl text-gray-500">Không tìm thấy sách!</div>
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="min-h-screen  flex items-center justify-center relative"
        >
          <BackButton className="absolute top-2 left-8 flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition cursor-pointer" />

          <div className="w-full mb-[48px] max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12 bg-transparent">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl p-10 text-center shadow-md flex flex-col items-center justify-center"
            >
              <img
                src={book.image}
                alt={book.title}
                className="w-full h-full object-cover rounded-lg"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-3xl font-bold mb-3 text-primary"
              >
                {book.title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-[17.6px] text-slate-400 mb-2"
              >
                Tác giả: {book.author}
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="text-base text-slate-400 mb-6"
              >
                Thể loại: {book.category_name}
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="text-base text-slate-800 mb-8 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(book.description),
                }}
              ></motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="bg-white rounded-xl p-6 mb-6 shadow"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-base text-slate-800">Giá mua:</span>
                  <span className="text-2xl font-bold text-secondary1">
                    {book.priceBuy.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base text-slate-800">Giá thuê:</span>
                  <span className="text-2xl font-bold text-secondary1">
                    {book.priceRent.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="flex gap-4"
              >
                <button
                  className="flex-1 py-4 font-semibold bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors duration-200 cursor-pointer rounded-xl"
                  onClick={() =>
                    router.push(`/${ADMIN_PREFIX}/books/edit/${book.slug}`)
                  }
                >
                  Chỉnh sửa
                </button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
