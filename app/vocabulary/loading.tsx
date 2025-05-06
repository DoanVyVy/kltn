import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-game-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-48 bg-gray-200" />
          <Skeleton className="mt-2 h-5 w-96 bg-gray-200" />
        </div>

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Skeleton className="h-10 w-full md:max-w-md bg-gray-200" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24 bg-gray-200" />
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Skeleton className="h-10 w-36 bg-gray-200" />
            <Skeleton className="mt-2 h-5 w-72 bg-gray-200" />
          </div>
          <Skeleton className="h-10 w-40 bg-gray-200" />
        </div>

        <Skeleton className="mb-6 h-12 w-full bg-gray-200" />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="rounded-lg border border-gray-200 p-4">
                <Skeleton className="h-8 w-3/4 bg-gray-200" />
                <div className="mt-2 flex items-center gap-2">
                  <Skeleton className="h-4 w-4 bg-gray-200" />
                  <Skeleton className="h-4 w-40 bg-gray-200" />
                </div>
                <Skeleton className="mt-4 h-2 w-full bg-gray-200" />
                <div className="mt-4 flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-20 rounded-full bg-gray-200" />
                  <Skeleton className="h-6 w-24 rounded-full bg-gray-200" />
                </div>
                <Skeleton className="mt-4 h-20 w-full bg-gray-200" />
                <div className="mt-4 flex gap-2">
                  <Skeleton className="h-10 w-full bg-gray-200" />
                  <Skeleton className="h-10 w-20 bg-gray-200" />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
