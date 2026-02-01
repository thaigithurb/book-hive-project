export default function OrderDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-12">
      <div className="container mx-auto px-2 sm:px-4 max-w-2xl">
        <div className="bg-white rounded-2xl shadow p-4 sm:p-6 md:p-10 animate-pulse">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
          </div>

          <div className="mb-6">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-3" />
            <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-2">
                  <div className="h-4 bg-gray-200 rounded w-20" />
                  <div className="h-4 bg-gray-200 rounded flex-1" />
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-3" />
            <div className="divide-y border-t border-b">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 py-4 items-start sm:items-center"
                >
                  <div className="flex gap-3 w-full sm:w-auto">
                    <div className="w-16 h-24 bg-gray-200 rounded border" />
                    <div className="flex-1 min-w-0 sm:hidden space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="hidden sm:block flex-1 min-w-0 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                  <div className="hidden sm:block h-4 bg-gray-200 rounded min-w-[100px] w-1/3" />
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 p-4 rounded-lg">
            <div className="w-full sm:w-auto flex justify-between sm:block">
              <div className="h-3 bg-gray-200 rounded w-1/3 mb-1" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
            </div>
            <div className="w-full sm:w-auto flex justify-between sm:block text-right sm:text-left">
              <div className="h-3 bg-gray-200 rounded w-1/3 mb-1" />
              <div className="h-6 bg-gray-200 rounded w-16" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center border-t pt-6 gap-3">
            <div className="h-5 bg-gray-200 rounded w-1/6" />
            <div className="h-7 bg-gray-200 rounded w-1/4" />
          </div>

          <div className="mt-8 flex justify-end">
            <div className="h-10 bg-gray-200 rounded w-full sm:w-40" />
          </div>
        </div>
      </div>
    </div>
  );
}
