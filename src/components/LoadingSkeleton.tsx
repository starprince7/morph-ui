export default function LoadingSkeleton() {
  return (
    <div className="w-full min-h-[600px] p-8 animate-pulse">
      <div className="space-y-4">
        <div className="h-8 bg-black/[.05] dark:bg-white/[.06] rounded-lg w-3/4"></div>
        <div className="h-4 bg-black/[.05] dark:bg-white/[.06] rounded w-1/2"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-black/[.05] dark:bg-white/[.06] rounded-lg"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}