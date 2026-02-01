import Link from "next/link";
import { Book } from "@/app/interfaces/book.interface";
import Image from "next/image";
import { AiOutlineDelete } from "react-icons/ai";

interface FavoriteCardProps {
  book: Book;
  onRemove?: (bookId: string) => void;
}

export const FavoriteCard = ({ book, onRemove }: FavoriteCardProps) => (
  <div className="relative group h-full">
    <Link
      href={`/books/detail/${book.slug}`}
      className="block h-full bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
    >
      <div className="flex flex-col h-full">
        <div className="relative w-full h-[180px] sm:h-[220px] bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
          {book.image ? (
            <Image
              width={400}
              height={400}
              src={book.image}
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="text-4xl md:text-5xl">📚</div>
          )}
        </div>

        <div className="flex-1 flex flex-col p-3 md:p-4">
          <div className="mb-2">
            <h3 className="font-bold text-sm md:text-base text-primary mb-1 line-clamp-2 min-h-[40px] md:min-h-[48px]">
              {book.title}
            </h3>
            <p className="text-xs md:text-sm text-secondary2 line-clamp-1">
              {book.author}
            </p>
          </div>

          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 border-dashed">
            <span className="text-sm md:text-base font-bold text-secondary1">
              {book.priceBuy
                ? book.priceBuy.toLocaleString("vi-VN") + "đ"
                : "Liên hệ"}
            </span>
            <span className="text-blue-500 text-lg md:text-xl transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </div>
        </div>
      </div>
    </Link>
    {onRemove && (
      <button
        className="absolute top-2 right-2 md:top-3 md:right-3 z-20 p-2 bg-white/90 backdrop-blur-sm text-red-500 rounded-full shadow-sm border border-red-100 hover:bg-red-500 hover:text-white hover:shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95"
        title="Xóa khỏi yêu thích"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove(book._id);
        }}
      >
        <AiOutlineDelete size={18} className="md:w-5 md:h-5" />
      </button>
    )}
  </div>
);
