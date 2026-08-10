import clsx from "clsx";

export default function ProgressBar({
  value = 0,
  size = "md",
  showLabel = true,
}) {
  const heights = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  const percentage = Math.max(0, Math.min(100, value));

  return (
    <div className="w-full">

      {showLabel && (
        <div className="flex justify-between mb-2">

          <span className="text-sm text-slate-400">
            Progress
          </span>

          <span className="text-sm font-medium text-white">
            {percentage}%
          </span>

        </div>
      )}

      <div
        className={clsx(
          "w-full rounded-full bg-slate-800 overflow-hidden",
          heights[size]
        )}
      >
        <div
          className={clsx(
            "h-full rounded-full bg-indigo-500 transition-all duration-500"
          )}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

    </div>
  );
}