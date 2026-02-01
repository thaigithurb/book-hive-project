export default function ProfileSkeleton() {
  return (
    <div className="container mx-auto py-8 md:py-12 lg:py-24 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="h-8 w-1/3 bg-gray-200 rounded mb-6 md:mb-8" />
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-8 animate-pulse">
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-6 pb-6 border-b">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2 w-full">
                <div className="h-6 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <div className="h-3 bg-gray-100 rounded w-1/3 mb-2" />
                  <div className="h-5 bg-gray-200 rounded w-2/3" />
                </div>
                <div>
                  <div className="h-3 bg-gray-100 rounded w-1/3 mb-2" />
                  <div className="h-5 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
              <div>
                <div className="h-3 bg-gray-100 rounded w-1/4 mb-2" />
                <div className="h-5 bg-gray-200 rounded w-1/2" />
              </div>
              <div>
                <div className="h-3 bg-gray-100 rounded w-1/4 mb-2" />
                <div className="h-5 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-6 border-t">
            <div className="h-10 bg-gray-200 rounded w-full sm:w-40" />
            <div className="h-10 bg-gray-200 rounded w-full sm:w-40" />
          </div>
        </div>
        <div className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <div className="h-24 bg-gray-100 rounded-lg" />
          <div className="h-24 bg-gray-100 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
