export function MenuCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-crema/10 bg-crema-dark">
      <div className="h-36 bg-carbone" />
      <div className="space-y-3 p-4">
        <div className="flex justify-between gap-2">
          <div className="h-4 w-1/3 rounded bg-rosso-dark" />
          <div className="h-4 w-10 rounded bg-rosso-dark" />
        </div>
        <div className="h-3 w-full rounded bg-carbone" />
        <div className="h-3 w-5/6 rounded bg-carbone" />
        <div className="flex justify-between pt-1">
          <div className="h-3 w-16 rounded bg-carbone" />
          <div className="h-8 w-20 rounded-md bg-rosso-dark" />
        </div>
      </div>
    </div>
  );
}
