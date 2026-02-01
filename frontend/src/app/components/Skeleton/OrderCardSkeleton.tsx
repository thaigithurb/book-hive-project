import React from "react";

type Props = {
  fullScreen?: boolean;
  count?: number;
};

export default function OrderCardSkeleton({
  fullScreen = false,
  count = 4,
}: Props) {
  return (
    <div
      className={
        fullScreen ? "min-h-screen flex items-center justify-center" : ""
      }
    >
      <div className={`w-full ${fullScreen ? "max-w-3xl" : ""} space-y-4`}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
          >
            <div className="block p-4 md:p-6">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-x-2 gap-y-4 md:gap-4 mb-4">
                <div className="md:col-span-2">
                  <div className="h-3 w-24 bg-gray-200 rounded mb-1" />
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                </div>
                <div>
                  <div className="h-3 w-20 bg-gray-200 rounded mb-1" />
                  <div className="h-4 w-16 bg-gray-200 rounded" />
                </div>
                <div>
                  <div className="h-3 w-20 bg-gray-200 rounded mb-1" />
                  <div className="h-4 w-16 bg-gray-200 rounded" />
                </div>
                <div>
                  <div className="h-3 w-20 bg-gray-200 rounded mb-1" />
                  <div className="h-4 w-20 bg-gray-200 rounded" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <div className="h-3 w-20 bg-gray-200 rounded mb-1" />
                  <div className="h-5 w-24 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="pt-3 md:pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex-shrink-0 w-12 h-14 md:w-14 md:h-16 bg-gray-200 rounded overflow-hidden" />
                  <div className="flex-shrink-0 w-12 h-14 md:w-14 md:h-16 bg-gray-200 rounded overflow-hidden" />
                  <div className="flex-1 min-w-0">
                    <div className="h-4 w-32 bg-gray-200 rounded mb-1" />
                    <div className="h-3 w-20 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5 md:px-6 md:py-3 bg-gray-50 border-t border-gray-200">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-5 w-5 bg-gray-200 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
