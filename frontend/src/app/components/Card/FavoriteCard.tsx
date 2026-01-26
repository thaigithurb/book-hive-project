import Link from "next/link";
import { Book } from "@/app/interfaces/book.interface";

interface FavoriteCardProps {
  book: Book;
}

export const FavoriteCard = ({ book }: FavoriteCardProps) => (
  <Link
    href={`/books/detail/${book.slug}`}
    className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
  >
    <div className="flex flex-col md:flex-row gap-4 p-4">
      <div className="flex-shrink-0 w-24 h-32 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
        {book.image ? (
          <img
            src={book.image}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">
            📚
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-lg text-primary mb-1 line-clamp-2">
            {book.title}
          </h3>
          <p className="text-sm text-secondary2 mb-2">{book.author}</p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[15px] font-bold text-secondary1">
            {book.priceBuy
              ? book.priceBuy.toLocaleString("vi-VN") + "đ"
              : "Liên hệ"}
          </span>
          <span className="text-blue-500 text-xl">→</span>
        </div>
      </div>
    </div>
  </Link>
);