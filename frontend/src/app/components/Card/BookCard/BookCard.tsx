import { Book } from "@/app/interfaces/book.interface";
import Link from "next/link";

interface BookCardProps {
  book: Book;
  featured?: boolean;
}

export const BookCard = ({ book, featured }: BookCardProps) => {
  return (
    <Link href={`/books/detail/${book.slug}`}>
      <div
        className={`bg-[#ffff] rounded-[16px] p-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] cursor-pointer transition-transform duration-300 hover:-translate-y-2 relative`}
      >
        {featured && (
          <span className="absolute top-4 right-4 bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded shadow-lg z-10">
            Nổi bật
          </span>
        )}
        <div className="mb-[8px] h-[190px] object-cover ">
          <img
            src={book.image}
            className="w-full h-full object-cover rounded-[10px]"
            alt={book.title}
          />
        </div>
        <h3 className="text-[17px] line-clamp-1 min-h-[28px] font-[700] mb-[8px] text-primary">
          {book.title}
        </h3>
        <p className="text-[14.4px] text-secondary2 mb-[8px]">{book.author}</p>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-yellow-400 text-[16px]">⭐</span>
          <span className="text-[14.4px] text-primary">Chưa có đánh giá</span>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div>
            <p className="text-[17.6px] font-bold text-secondary1 m-0">
              {book.priceBuy.toLocaleString("vi-VN")}đ
            </p>
            <p className="text-[13.6px] text-secondary2 mt-1 mb-0">
              Thuê: {book.priceRent.toLocaleString("vi-VN")}đ
            </p>
          </div>
          <span className="text-[24px]">→</span>
        </div>
      </div>
    </Link>
  );
};
