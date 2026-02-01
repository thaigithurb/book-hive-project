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
      className={`${fullScreen ? "min-h-screen flex items-center justify-center" : ""}`}
    >
      <div className={`w-full ${fullScreen ? "max-w-3xl" : ""} space-y-4`}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-4 bg-white rounded-2xl p-4 md:p-6 shadow-sm animate-pulse"
          >
            <div className="w-20 h-28 bg-gray-200 rounded-md flex-shrink-0" />
            <div className="flex-1 space-y-3 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-200 rounded w-2/5" />
              <div className="flex items-center gap-3 mt-2">
                <div className="h-8 w-24 bg-gray-200 rounded" />
                <div className="h-8 w-16 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
