import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-game-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-56 bg-gray-200" />
          <Skeleton className="mt-2 h-5 w-96 bg-gray-200" />
        </div>

        {/* Dashboard tổng quan skeleton */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-200 bg-white/90 p-4 shadow-sm"
            >
              <Skeleton className="h-6 w-1/3 bg-gray-200" />
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center">
                  <Skeleton className="mr-3 h-8 w-8 rounded-full bg-gray-200" />
                  <div>
                    <Skeleton className="h-8 w-16 bg-gray-200" />
                    <Skeleton className="mt-1 h-4 w-32 bg-gray-200" />
                  </div>
                </div>
                <Skeleton className="h-8 w-20 bg-gray-200" />
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-32 bg-gray-200" />
            <Skeleton className="mt-2 h-4 w-72 bg-gray-200" />
          </div>
          <Skeleton className="h-10 w-40 bg-gray-200" />
        </div>

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Skeleton className="h-10 w-full md:max-w-md bg-gray-200" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24 bg-gray-200" />
          </div>
        </div>

        <Skeleton className="mb-6 h-12 w-full bg-gray-200" />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-gray-200 bg-white/90 p-4 shadow-sm"
              >
                <div className="mb-4">
                  <Skeleton className="h-7 w-3/4 bg-gray-200" />
                  <Skeleton className="mt-2 h-4 w-1/2 bg-gray-200" />
                </div>
                <div className="mb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-1/3 bg-gray-200" />
                    <Skeleton className="h-4 w-12 bg-gray-200" />
                  </div>
                  <Skeleton className="h-2 w-full bg-gray-200" />
                </div>
                <Skeleton className="mb-4 h-4 w-40 bg-gray-200" />
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-10 w-full bg-gray-200" />
                  <Skeleton className="h-10 w-full bg-gray-200" />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
