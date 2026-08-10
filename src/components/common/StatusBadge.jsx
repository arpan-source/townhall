const COLORS = {
  "Not Started": "bg-slate-600",
  "In Progress": "bg-blue-600",
  Completed: "bg-emerald-600",
  Blocked: "bg-red-600",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs text-white ${COLORS[status]}`}
    >
      {status}
    </span>
  );
}