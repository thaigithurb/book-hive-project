"use client";

import { Suspense } from "react";
import BooksContent from "./BooksContent";
import { BookCardSkeleton } from "@/app/components/Skeleton/BookCardSkeleton";

export default function Books() {
  return (
    <Suspense
      fallback={
        <div className="py-4 px-4 md:py-[32px] md:px-[24px]">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-[24px] mb-8">
              {Array.from({ length: 12 }).map((_, i) => (
                <BookCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <BooksContent />
    </Suspense>
  );
}
