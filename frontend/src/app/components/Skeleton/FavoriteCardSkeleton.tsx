export const FavoriteCardSkeleton = () => (
  <div className="relative group h-full">
    <div className="block h-full bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
      <div className="flex flex-col md:flex-row h-full">
        <div className="w-full h-[200px] md:w-[180px] md:h-auto bg-gray-200 shrink-0" />

        <div className="flex-1 flex flex-col p-3 md:p-5">
          <div className="mb-2">
            <div className="h-5 md:h-6 bg-gray-200 rounded mb-2 w-3/4" />
            <div className="h-3 md:h-4 bg-gray-100 rounded mb-3 w-1/2" />
            <div className="hidden md:block space-y-1">
              <div className="h-3 bg-gray-100 rounded w-4/5" />
              <div className="h-3 bg-gray-100 rounded w-3/4" />
            </div>
          </div>

          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 border-dashed">
            <div className="h-5 md:h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-5 md:h-6 bg-gray-100 rounded w-6" />
          </div>
        </div>
      </div>
    </div>
  </div>
);
