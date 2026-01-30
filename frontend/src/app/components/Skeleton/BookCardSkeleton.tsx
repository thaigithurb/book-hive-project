export const BookCardSkeleton = () => (
  <div className="bg-[#fff] rounded-2xl p-3 md:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)] animate-pulse">
    <div className="mb-2 h-[140px] md:h-[190px] bg-gray-200 rounded-[10px]" />
    <div className="h-5 md:h-6 bg-gray-200 rounded mb-2 w-2/3 md:w-3/4" />
    <div className="h-3 md:h-4 bg-gray-100 rounded mb-2 w-1/2" />
    <div className="flex items-center gap-2 mb-2 md:mb-3">
      <div className="w-4 h-4 md:w-5 md:h-5 bg-gray-200 rounded-full" />
      <div className="h-3 md:h-4 bg-gray-100 rounded w-1/4 md:w-1/3" />
    </div>
    <div className="h-5 md:h-6 bg-gray-200 rounded w-1/3 md:w-1/2 mb-1" />
    <div className="h-3 md:h-4 bg-gray-100 rounded w-1/4 md:w-1/3" />
  </div>
);