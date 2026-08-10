import StatusBadge from "../../ui/StatusBadge";

export default function InitiativeHeader({
  initiative,
  department,
}) {
  return (
    <div className="space-y-5">

      <div className="flex items-start justify-between">

        <div>

          <h1 className="text-2xl font-bold text-white">
            {initiative.title}
          </h1>

          <p className="text-slate-400 mt-2">
            Initiative Details
          </p>

        </div>
{/* 
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white text-2xl transition"
        >
          ✕
        </button> */}

      </div>

      <div className="flex flex-wrap gap-3">

        <span className="px-3 py-1 rounded-full bg-indigo-600 text-sm text-white">
          {department?.name ?? "No Department"}
        </span>

        <span className="px-3 py-1 rounded-full bg-slate-700 text-sm text-white">
          {initiative.profiles?.full_name ?? "Unknown"}
        </span>

        <StatusBadge
          status={initiative.status}
        />

      </div>

    </div>
  );
}