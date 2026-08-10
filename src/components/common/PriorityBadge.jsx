const COLORS = {
    Low: "bg-slate-600",
    Medium: "bg-yellow-500",
    High: "bg-orange-500",
    Critical: "bg-red-600",
};

export default function PriorityBadge({ priority }) {

    return (
        <span
            className={`inline-block px-3 py-1 rounded-full text-white text-sm ${COLORS[priority]}`}
        >
            {priority}
        </span>
    );
}