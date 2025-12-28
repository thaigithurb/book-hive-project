import { useRouter } from "next/navigation";

interface BookTableActionsProps {
  slug: string;
  id: string;
  onDelete: (id: string) => void;
}

export default function BookTableActions({ slug, id, onDelete }: BookTableActionsProps) {
  const router = useRouter();

  return (
    <div className="flex gap-2">
      <button
        className="py-1 px-3 rounded-[6px] text-[13.6px] font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors duration-200 cursor-pointer"
        onClick={() => {
          router.push(`/admin/books/detail/${slug}`);
        }}
      >
        Chi tiết
      </button>
      <button
        className="py-1 px-3 rounded-[6px] text-[13.6px] font-semibold bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors duration-200 cursor-pointer"
        onClick={() => {
          router.push(`/admin/books/edit/${slug}`);
        }}
      >
        Sửa
      </button>
      <button
        className="py-1 px-3 rounded-[6px] text-[13.6px] font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-colors duration-200 cursor-pointer"
        onClick={() => onDelete(id)}
      >
        Xóa
      </button>
    </div>
  );
}