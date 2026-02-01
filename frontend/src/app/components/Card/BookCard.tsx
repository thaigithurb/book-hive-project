import { Book } from "@/app/interfaces/book.interface";
import Image from "next/image";
import Link from "next/link";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { FaStar } from "react-icons/fa";
import { FaArrowRightLong } from "react-icons/fa6";

interface BookCardProps {
  book: Book;
  featured?: boolean;
  newest?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (bookId: string, next: boolean) => void;
  isLoggedIn: boolean;
}

export const BookCard = ({
  book,
  featured,
  newest,
  isFavorite = false,
  isLoggedIn,
  onToggleFavorite,
}: BookCardProps) => {
  return (
    <div className="relative group h-full">
      <Link href={`/books/detail/${book.slug}`} className="block h-full">
        <div className="bg-[#ffff] rounded-2xl p-3 md:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)] cursor-pointer transition-transform duration-300 hover:-translate-y-2 relative h-full flex flex-col">
          {featured ? (
            <span className="absolute top-2 right-2 md:top-4 md:right-4 bg-yellow-400 text-white text-[10px] md:text-xs font-bold px-2 py-0.5 md:px-3 md:py-1 rounded shadow-lg z-10">
              Nổi bật
            </span>
          ) : newest ? (
            <span className="absolute top-2 right-2 md:top-4 md:right-4 bg-blue-500 text-white text-[10px] md:text-xs font-bold px-2 py-0.5 md:px-3 md:py-1 rounded shadow-lg z-10">
              Mới nhất
            </span>
          ) : null}

          <div className="mb-2 h-[140px] sm:h-[160px] md:h-[190px] object-cover shrink-0">
            <Image
              src={book.image}
              className="w-full h-full object-cover rounded-[10px]"
              alt={book.title}
              width={400}
              height={400}
            />
          </div>

          <div className="flex flex-col flex-1">
            <h3 className="text-sm sm:text-base md:text-[17px] line-clamp-1 min-h-[20px] md:min-h-[28px] font-[700] mb-1 md:mb-[8px] text-primary">
              {book.title}
            </h3>
            <p className="text-xs sm:text-sm md:text-[14.4px] text-secondary2 mb-1 md:mb-[8px] line-clamp-1">
              {book.author}
            </p>
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <span className="text-yellow-400 text-sm md:text-[16px]">
                <FaStar />
              </span>
              <span className="text-xs md:text-[14.4px] text-primary">
                Chưa có đánh giá
              </span>
            </div>

            <div className="flex justify-between items-center mt-auto pt-2">
              <div>
                <p className="text-base md:text-[17.6px] font-bold text-secondary1 m-0">
                  {book.priceBuy
                    ? book.priceBuy.toLocaleString("vi-VN") + "đ"
                    : "Liên hệ"}
                </p>
                <p className="text-[10px] md:text-[13.6px] text-secondary2 mt-1 mb-0">
                  Thuê:{" "}
                  {book.priceRentOptions?.find(
                    (option) => option.type === "day",
                  )?.price
                    ? book.priceRentOptions
                        .find((option) => option.type === "day")!
                        .price.toLocaleString("vi-VN") + "đ"
                    : "Liên hệ"}
                </p>
              </div>
              <span className="text-base md:text-[20px] text-primary">
                <FaArrowRightLong />
              </span>
            </div>
          </div>
        </div>
      </Link>
      {isLoggedIn && (
        <button
          className="absolute cursor-pointer top-2 left-2 md:top-6 md:left-6 z-20 bg-white/80 rounded-full p-1 hover:scale-110 transition-all shadow-sm"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite?.(book._id, !isFavorite);
          }}
          aria-label="Yêu thích"
        >
          {isFavorite ? (
            <AiFillHeart
              size={24}
              className="text-red-500 transition-all duration-200 md:w-[28px] md:h-[28px]"
            />
          ) : (
            <AiOutlineHeart
              size={24}
              className="text-gray-400 transition-all duration-200 md:w-[28px] md:h-[28px]"
            />
          )}
        </button>
      )}
    </div>
  );
};
