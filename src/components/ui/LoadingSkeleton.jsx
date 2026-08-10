export default function LoadingSkeleton({
  lines = 3,
}) {
  return (
    <div className="animate-pulse">

      <div className="h-5 w-1/3 rounded bg-slate-700 mb-6" />

      <div className="space-y-3">

        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className="h-4 rounded bg-slate-800"
          />
        ))}

      </div>

    </div>
  );
}