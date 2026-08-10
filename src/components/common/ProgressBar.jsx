export default function ProgressBar({ value }) {
  return (
    <div>

      <div className="flex justify-between mb-2">

        <span className="text-slate-400 text-sm">
          Progress
        </span>

        <span className="text-white text-sm">
          {value}%
        </span>

      </div>

      <div className="h-2 rounded bg-slate-700">

        <div
          className="h-full rounded bg-indigo-500"
          style={{
            width: `${value}%`,
          }}
        />

      </div>

    </div>
  );
}