export function MenuCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-crema/10 bg-crema-dark">
      <div className="h-[140px] bg-[#2d1b11]" />
      <div className="space-y-3 p-4">
        <div className="flex justify-between gap-2">
          <div className="h-4 w-1/3 rounded bg-[#3d2719]" />
          <div className="h-4 w-10 rounded bg-[#3d2719]" />
        </div>
        <div className="h-3 w-full rounded bg-[#2d1b11]" />
        <div className="h-3 w-5/6 rounded bg-[#2d1b11]" />
        <div className="flex justify-between pt-1">
          <div className="h-3 w-16 rounded bg-[#2d1b11]" />
          <div className="h-8 w-20 rounded-md bg-[#5c1616]" />
        </div>
      </div>
    </div>
  );
}
