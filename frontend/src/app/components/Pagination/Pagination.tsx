interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  total,
  limit,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(total / limit);

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center gap-2 mt-6">
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className={`px-3 py-1 rounded bg-gray-200 disabled:opacity-50 transition-colors duration-200 ${
          page === 1 ? "" : "hover:bg-blue-100 cursor-pointer"
        }`}
      >
        Trước
      </button>
      {[...Array(totalPages)].map((_, index) => (
        <button
          key={index}
          onClick={() => onPageChange(index + 1)}
          className={`px-3 py-1 rounded transition-colors duration-200
            ${
              page === index + 1
                ? "bg-blue-500 text-white cursor-default"
                : "bg-gray-100 hover:bg-blue-100 cursor-pointer"
            }`}
        >
          {index + 1}
        </button>
      ))}
      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className={`px-3 py-1 rounded bg-gray-200 disabled:opacity-50 transition-colors duration-200 ${
          page === totalPages ? "" : "hover:bg-blue-100 cursor-pointer"
        }`}
      >
        Sau
      </button>
    </div>
  );
}
