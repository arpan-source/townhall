import clsx from "clsx";

const variants = {
  "Not Started": {
    bg: "bg-slate-700",
    text: "text-slate-200",
  },
  "In Progress": {
    bg: "bg-blue-500/15",
    text: "text-blue-400",
  },
  Completed: {
    bg: "bg-green-500/15",
    text: "text-green-400",
  },
  Blocked: {
    bg: "bg-red-500/15",
    text: "text-red-400",
  },
  "At Risk": {
    bg: "bg-amber-500/15",
    text: "text-amber-400",
  },
  Overdue: {
  bg: "bg-red-500/15",
  text: "text-red-400",
  },
};

export default function StatusBadge({
  status,
  className = "",
}) {
  const style =
    variants[status] || variants["Not Started"];

  return (
    <span
      className={clsx(
        "inline-flex items-center",
        "px-3 py-1",
        "rounded-full",
        "text-xs font-semibold",
        style.bg,
        style.text,
        className
      )}
    >
      {status}
    </span>
  );
}