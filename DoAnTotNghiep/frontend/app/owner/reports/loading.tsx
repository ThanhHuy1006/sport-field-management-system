import { Skeleton } from "@/components/ui/skeleton"

export default function OwnerReportsLoading() {
  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-40" />
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-[300px]" />
          <Skeleton className="h-10 w-[150px]" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>

        <Skeleton className="h-10 w-full max-w-md" />

        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] rounded-lg" />
          <Skeleton className="h-[400px] rounded-lg" />
        </div>
      </div>
    </main>
  )
}
